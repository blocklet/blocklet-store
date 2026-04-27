const { AIAgent, AIGNE } = require('@aigne/core');
const { z } = require('zod');
const { AIGNEHubChatModel } = require('@aigne/aigne-hub');
const { joinURL } = require('ufo');
const { default: axios } = require('axios');
const { isURL } = require('validator');
const { Keyv } = require('keyv');
const uniq = require('lodash/uniq');
const { isValid } = require('@arcblock/did');
const {
  searchBlockletsInstructions,
  aigneApiCredential,
  aigneApiModel,
  aigneApiUrl,
  AI_KIT_DID,
  aigneApiUrlCacheTTL,
  aigneInvokeCacheTTL,
} = require('../libs/env');
const logger = require('../libs/logger');

const getAccessKey = () => {
  try {
    if (!aigneApiCredential || typeof aigneApiCredential !== 'string') {
      return null;
    }

    return JSON.parse(aigneApiCredential).apiKey;
  } catch (error) {
    console.error('getAccessKey', error);
    return null;
  }
};

const hubApiUrlCache = new Keyv({ namespace: 'hubApiUrl', ttl: aigneApiUrlCacheTTL }); // 1 hour
const suggestKeywordsCache = new Keyv({ namespace: 'suggestKeywords', ttl: aigneInvokeCacheTTL });

const getHubApiUrl = async () => {
  try {
    if (!aigneApiUrl) {
      return null;
    }

    if (!isURL(aigneApiUrl)) {
      return null;
    }

    // Check cache first
    const cached = await hubApiUrlCache.get(aigneApiUrl);
    if (cached) {
      return cached;
    }

    const { data: blockletJson } = await axios.get(joinURL(aigneApiUrl, '__blocklet__.js?type=json'));
    const { componentMountPoints = [] } = blockletJson || {};
    const mountPoint = componentMountPoints.find((item) => item.did === AI_KIT_DID);
    if (!mountPoint) {
      throw new Error("The current application doesn't have the AIGNE Hub component installed");
    }

    const hubApiUrl = joinURL(new URL(aigneApiUrl).origin, mountPoint.mountPoint);
    // Set cache
    await hubApiUrlCache.set(aigneApiUrl, hubApiUrl);
    return hubApiUrl;
  } catch (error) {
    console.error('getHubApiUrl', error);
    return null;
  }
};

async function getModel() {
  if (!aigneApiCredential) {
    return null;
  }

  if (!aigneApiUrl) {
    return null;
  }

  const accessKey = getAccessKey();
  if (!accessKey) {
    return null;
  }

  const url = await getHubApiUrl();

  return new AIGNEHubChatModel({
    model: aigneApiModel,
    apiKey: accessKey,
    baseURL: url,
  });
}

/**
 * @param {string} keyword
 * @returns {Promise<string[]>}
 */
async function getKeywords(keyword) {
  if (!keyword) {
    return [keyword];
  }

  if (isValid(keyword.trim())) {
    return [keyword];
  }

  const cached = await suggestKeywordsCache.get(keyword);
  if (cached) {
    logger.info('get_suggest_keywords', {
      question: keyword,
      keywords: cached,
      cached: true,
    });
    return cached;
  }

  const model = await getModel();
  if (!model) {
    return [keyword];
  }

  const aigne = new AIGNE({ model });
  const agent = AIAgent.from({
    name: 'get_suggest_keywords',
    description: 'Get the search suggest words from the user question',
    instructions: searchBlockletsInstructions,
    inputSchema: z.object({
      question: z.string().describe('The user question'),
    }),
    outputSchema: z.object({
      keywords: z.array(z.string()).describe('The topic of the request'),
    }),
  });

  /** @type {{keywords: string[]}} */
  const result = await aigne
    .invoke(agent, {
      question: keyword,
    })
    .catch((error) => {
      console.error('aigne.invoke', error);
      return { keywords: [keyword] };
    });
  const keywords = uniq([keyword].concat(...(result.keywords ?? [])).map((value) => value.trim().toLowerCase()));
  // set cache
  await suggestKeywordsCache.set(keyword, keywords);

  logger.info('get_suggest_keywords', {
    question: keyword,
    keywords,
    cached: false,
  });

  return keywords;
}

module.exports = { getKeywords };
