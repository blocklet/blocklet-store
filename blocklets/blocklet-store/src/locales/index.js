/* eslint-disable import/prefer-default-export */
import { translations as extraTranslations } from '@blocklet/payment-react';
import { merge } from 'lodash-es';

import en from './en';
import zh from './zh';

export const translations = merge({ zh, en }, extraTranslations);
