## 0.18.19 (April 24, 2026)

- chore: upgrade arcblock ux dependencies
- fix: resolve immediate dependabot alerts
- chore(deps): pnpm dedupe to consolidate duplicate transitive versions
- chore(security): bump tar 6.1.11 → 7.5.13 to patch extraction CVEs

## 0.18.18 (April 23, 2026)

- chore(security): patch high/medium CVEs in direct deps (tier 1)

## 0.18.17 (April 23, 2026)

- chore(deps): bump blocklet-server 1.17.7→1.17.12 and blockchain 1.28.1→1.29.27

## 0.18.16 (February 11, 2026)

- fix: retention job reports 0 B freed space due to size calculated after deletion

## 0.18.15 (February 11, 2026)

- fix: retention dry run switch unresponsive in preferences form

## 0.18.14 (February 10, 2026)

- fix: bundle issue

## 0.18.13 (February 10, 2026)

- feat: add version data retention to auto-clean old blocklet tarballs

## 0.18.11 (January 06, 2026)

- fix: bundle throw error "Chunk Size Limit Exceeded"

## 0.18.10 (January 05, 2026)

- chore: update deps

## 0.18.9 (December 15, 2025)

- chore: update dependencies

## 0.18.8 (December 05, 2025)

- chore: update dependencies

## 0.18.7 (December 03, 2025)

- chore: bump search kit client to latest

## 0.18.6 (November 28, 2025)

- chore: update dependencies

## 0.18.5 (November 14, 2025)

- chore: update dependencies

## 0.18.4 (November 07, 2025)

- chore: update dependencies

## 0.18.3 (November 06, 2025)

- chore: update dependencies

## 0.18.2 (November 04, 2025)

- chore: update dependencies

## 0.18.1 (October 29, 2025)

- fix(core): correct incorrect import statements for config and component

## 0.18.0 (October 29, 2025)

- chore(deps): upgrade authentication sdk to latest version

## 0.17.30 (October 14, 2025)

- fix(store): incorrect cdn() express middleware configuration

## 0.17.29 (October 14, 2025)

- fix(store): vite config bug

## 0.17.28 (October 14, 2025)

- feat(store): support for loading blocklet CDN static assets

## 0.17.27 (October 10, 2025)

- feat: support org mode, use org to manage blocklets

## 0.17.26 (October 09, 2025)

- fix(store): enhance error message for insufficient balance during staking

## 0.17.25 (October 09, 2025)

- chore: update dependencies to latest stable versions

## 0.17.24 (October 03, 2025)

- feat(ui): add official blocklet filter
- fix(locales): update viewDemo text to include example reference
- fix(ui): resolve page crash after translation button click
- fix(api): reslove query count error and restore pagination functionality

## 0.17.23 (September 08, 2025)

- fix: page refresh error csrf mismatch when not logged in

## 0.17.22 (September 05, 2025)

- chore: bump deps to fix csrf token mismatch v2

## 0.17.21 (September 02, 2025)

- chore: bump deps to fix csrf token mismatch

## 0.17.20 (August 28, 2025)

- chore: update the blocklet package to the latest beta version

## 0.17.19 (August 28, 2025)

- feat: support google analytics

## 0.17.18 (August 21, 2025)

- fix: unable to start normally after updating @aigne/\* packages

## 0.17.17 (August 19, 2025)

- chore: update deps

## 0.17.16 (August 09, 2025)

- chore: bump deps to latest

## 0.17.15 (August 09, 2025)

- chore: bump deps to latest

## 0.17.14 (August 08, 2025)

- chore: bump deps to latest

## 0.17.13 (August 06, 2025)

- feat: disable intelligent search when keyword is a did

## 0.17.12 (July 31, 2025)

- feat(api): integrate payment webhooks and enhance error handling
- chore: update dependencies

## 0.17.11 (July 30, 2025)

- fix(ci): pnpm should use version 10

## 0.17.10 (July 30, 2025)

- chore: update deps

## 0.17.9 (July 28, 2025)

- feat: add click handler for PlayIcon to open video modal

## 0.17.8 (July 25, 2025)

- feat: add support for custom models and invocation caching

## 0.17.7 (July 24, 2025)

- feat: support smart blocklet search and mcp servers

## 0.17.6 (July 24, 2025)

- chore: update dependencies
- fix(schema): change page and pageSize validation to use integer type

## 0.17.5 (July 18, 2025)

- chore: update deps
- chore: upgrade to storybook9

## 0.17.4 (July 10, 2025)

- fix(blocklet): deprecate ocap declare check on start

## 0.17.3 (July 08, 2025)

- chore: update deps

## 0.17.2 (July 06, 2025)

- chore: add 404 fallback route for server api

## 0.17.1 (July 03, 2025)

- fix(core): store.blocklet.published not triggered on auto publish

## 0.17.0 (July 01, 2025)

- fix: lint error
- fix: build error
- fix: type error
- chore(deps): upgrade to vite@7, react@19, mui@7, ux@3

## 0.16.60 (June 27, 2025)

- feat(change-log): add version extraction function from H2 headings

## 0.16.59 (June 27, 2025)

- chore: bump deps to latest

## 0.16.58 (June 10, 2025)

- feat(layout): support displaying search icon in ArcSphere client

## 0.16.57 (June 10, 2025)

- chore(deps): update deps
- fix(list): fix performance issue in infinite-scroll

## 0.16.56 (June 09, 2025)

- refactor(ux): replace Material Icons with Iconify icons for Search and Close

## 0.16.55 (June 06, 2025)

- chore: update dependencies

## 0.16.54 (May 26, 2025)

- chore: update dependencies

## 0.16.53 (May 20, 2025)

- chore: update dependencies

## 0.16.52 (May 19, 2025)

- fix(ux): darken blocklet detail page tab text color

## 0.16.51 (May 17, 2025)

- chore: update dependencies
- style: update LaunchButton styles in detail page

## 0.16.50 (May 15, 2025)

- chore: update dependencies
- fix(auth): improve error messages and localization support in passport checks
- fix(locales): update pending review description for clarity

## 0.16.49 (May 12, 2025)

- chore: update dependencies

## 0.16.48 (May 09, 2025)

- fix(ux): blocklet info display issues in dark mode
- fix(ux): incorrect color of banner buttons in dark mode

## 0.16.47 (May 01, 2025)

- feat(ux): support for dark color themes

## 0.16.46 (April 30, 2025)

- chore: update deps

## 0.16.45 (April 23, 2025)

- chore(deps): update deps
- fix(ux): fix did-connect style

## 0.16.44 (April 16, 2025)

- fix(ux): @blocklet/list now supports blocklet theme

## 0.16.43 (April 16, 2025)

- chore: update dependencies

## 0.16.42 (April 14, 2025)

- chore: update deps

## 0.16.41 (April 12, 2025)

- chore: bump deps to latest

## 0.16.40 (April 09, 2025)

- fix(ux): support for theme provided by service
- chore: update dependencies

## 0.16.39 (April 07, 2025)

- chore: update dependencies
- fix(ux): handle long search results to prevent page errors
- fix(api): return accurate error information on signature parsing failure
- fix(ux): manage page store missing translation

## 0.16.38 (March 31, 2025)

- chore: bump deps to latest

## 0.16.37 (March 26, 2025)

- feat: add compact list for the modal display
- feat: auto fresh review status when the blocklet review status change

## 0.16.36 (March 21, 2025)

- chore: update dependencies

## 0.16.35 (March 17, 2025)

- chore: update dependencies

## 0.16.34 (March 17, 2025)

- chore: update deps

## 0.16.33 (March 16, 2025)

- chore: update deps

## 0.16.32 (March 13, 2025)

- chore: update deps

## 0.16.31 (March 12, 2025)

- chore(deps): update deps

## 0.16.30 (March 10, 2025)

- chore: update dependencies
- feat(api): support empty remake info

## 0.16.29 (February 27, 2025)

- feat: add blocklet published event for event bus

## 0.16.28 (February 25, 2025)

- chore: update schema to the latest
- feat(ux): optimize the UI for donations

## 0.16.27 (February 25, 2025)

- chore: update dependencies

## 0.16.26 (February 19, 2025)

- feat(ux): improve mobile responsiveness and layout for blocklet store

## 0.16.25 (February 19, 2025)

- feat: supports quick configuration of donate

## 0.16.24 (February 12, 2025)

- docs: add comprehensive API use case documentation for blocklet store
- fix(api): resolve search blocklet unresponsive issue
- feat: enhance error logging with request context in blocklet store routes

## 0.16.23 (February 12, 2025)

- feat: support auto-update for lambda functions and cloudfront

## 0.16.22 (February 11, 2025)

- fix(api): adjust HTTP status codes for api respose
- feat(schema): enhance validation with flexible schema wrapper
- chore: use beta version of @blocklet/cli

## 0.16.21 (February 10, 2025)

- chore: remove @blocklet/cli beta tag from npm and pnpm global installs

## 0.16.20 (February 10, 2025)

- feat: improve error handling in blocklet store list views
- feat: enhance upload process with transaction
- fix: show access logging in blocklet store

## 0.16.19 (February 07, 2025)

- chore: use setupAccessLogger logs the access log
- fix: display official icon on blocklet detail page
- chore: add middleware to check support query param
- chore: add a rollback mechanism to the upload and release process
- chore: validate params and use transaction for upload/publish

## 0.16.18 (February 04, 2025)

- feat: hide all blocklets when the logged-in user is a developer
- fix: solve the problem of failing to migrate the version table

## 0.16.17 (January 27, 2025)

- fix: reslove the query and sorting issues

## 0.16.16 (January 26, 2025)

- refactor: filter official blocklet using backend data
- fix: should return the count of valid blocklets
- chore: optimize packaging logic

## 0.16.15 (January 24, 2025)

- fix: owner and bocklet filtering should be parallel queries
- chore: remove declare on pre-start
- chore: replace lodash with lodash-es

## 0.16.14 (January 23, 2025)

- chore: pagination should always be done on backend
- chore: control permissions based on the user passport

## 0.16.13 (January 17, 2025)

- chore: update dependencies
- feat: support community analysis of blocklets
- feat: adding more hints to the auto-publish button
- fix: display the normal docker prompt

## 0.16.12 (January 15, 2025)

- feat: support add draft component to any blocklet

## 0.16.11 (January 14, 2025)

- refactor: use svg resources to replace remote resources
- fix: translate input category when the locale changed
- feat: integrate notification for review process
- fix: translate permission list

## 0.16.10 (January 13, 2025)

- feat: filter user privacy information
- feat: support cancel the review process
- feat: support filter blocklet by createdAt field for v2/blocklet.json

## 0.16.9 (January 10, 2025)

- chore: publish normally after switching the reviewing mode

## 0.16.8 (January 10, 2025)

- fix: insert new version when creating new draft

## 0.16.7 (January 10, 2025)

- fix: update the query condition for updating the official blocklet review method
- fix: update version table index and log more logs

## 0.16.6 (January 09, 2025)

- feat: update official blocklets review type to FIRST
- fix: show detail log when any error occurs

## 0.16.5 (January 09, 2025)

- fix: reslove some abnormal problems of the sorting function
- fix: fixed issues with the use of asynchronous methods

## 0.16.4 (January 09, 2025)

- fix: improve compatibility with did
- chore: migrate draft files
- fix: optimize sorting logic
- fix(ux): just refresh blocklet list when fetching new data
- fix: all blocklets page support search

## 0.16.3 (January 08, 2025)

- fix(db): reslove db migration issue

## 0.16.2 (January 07, 2025)

- fix(ux): add load more button for all blocklets page
- chore: support hide some development warnings
- chore(api): improve compatibility with dirty data

## 0.16.1 (January 07, 2025)

- fix(store): fix gen-key-pair auto timeout error

## 0.16.0 (January 07, 2025)

- fix(api): display all blocklets
- fix(api): filter invalid blocklet
- fix(db): reslove incorrect table name variable usage

## 0.15.16 (January 02, 2025)

- feat: add review process
- chore: optimize backend blocklet management

## 0.15.15 (December 31, 2024)

- feat: support reindex check when search kit start

## 0.15.14 (December 29, 2024)

- fix(ux): resolve the screenshot display issue on mobile
- fix: only supports querying public blocklets.

## 0.15.13 (December 25, 2024)

- feat(api): support query version count

## 0.15.12 (December 24, 2024)

- chore: update dependencies

## 0.15.11 (December 21, 2024)

- fix(api): resolve incomplete blocklet display issue(#1281)

## 0.15.10 (December 19, 2024)

- fix(api): reslove automatic release failure issue(#1275)

## 0.15.9 (December 15, 2024)

- feat: the store supports display videos of blocklet

## 0.15.8 (December 13, 2024)

- chore: integrate static scanning

## 0.15.7 (December 08, 2024)

- chore: update dependencies
- fix(api): the queries shouldreturn all resource types by default(#1272)

## 0.15.6 (December 07, 2024)

- chore: update dependencies

## 0.15.5 (December 06, 2024)

- fix: display correct donate units

## 0.15.4 (December 06, 2024)

- feat: default to displaying resources when navigating from detail page to homepage(#1261)
- fix(ui): show loading status when page fetches donation data

## 0.15.3 (December 05, 2024)

- fix(api): publish blocklet when the stake action success
- fix(api): returns the total number of blocklets correctly
- feat: display donate info

## 0.15.2 (December 05, 2024)

- chore: update all dependencies

## 0.15.1 (December 03, 2024)

- feat: reset Meilisearch once after the initial database migration
- fix: reslove the inability to publish Blocklets on mobile.

## 0.15.0 (November 29, 2024)

- chore: use sqlite as the default database
- refactor: remove unnecessary environment variables
- feat: implement auto-sync and update for search-kit information
  - You can now use `/api/console/blocklets/meilisearch_sync_failed` api with admin role to check for any data loss.
- fix(api): resolve data recovery issue from search-kit to blocklets

## 0.14.36 (November 28, 2024)

- fix(db): make sqlite migration work

## 0.14.35 (November 28, 2024)

- fix(ci): eslint errors

## 0.14.34 (November 28, 2024)

- chore: move schema migration to pre-flight

## 0.14.33 (November 26, 2024)

- chore: use sqlite as storage

## 0.14.32 (November 25, 2024)

- fix(api): update fix_blocklets API to follow RESTful conventions

## 0.14.31 (November 25, 2024)

- fix(ui): modify the not found page message
- feat(api): support recover blocklets from search-kit

## 0.14.30 (November 22, 2024)

- fix: just auto hide version info when the change log too long
- fix: enhance nft asset validation with optional chaining(#1254)

## 0.14.29 (November 21, 2024)

- chore: update dependencies
- fix: resolve stretched demo GIF display issue(#1244)
- fix: should render blocklet with correct host(#1251)
- feat: limit changelog display to recent entries if too long(#1251)
- feat: support admin and owner role as developer

## 0.14.28 (November 19, 2024)

- feat: display resource blocklet and showResource checkbox
- style: modify the checkbox style

## 0.14.27 (November 18, 2024)

- fix: add img tag alt attribute

## 0.14.26 (November 18, 2024)

- feat: add a batch query version information api

## 0.14.25 (November 16, 2024)

- feat: improve back button experience on detail page(#1240)
- fix: resolve issue with Svg not loading(#1241)
- chore: update all dependencies

## 0.14.24 (November 16, 2024)

- fix: fix white screen issue on developer page

## 0.14.23 (November 15, 2024)

- fix: display empty string when the bundle size is empty
- feat: hidden the back button when the page loading
- fix: the use of notification is undefined
- chore: update store logo

## 0.14.22 (November 13, 2024)

- feat: update blocklet-server to the stable version(#1185)

## 0.14.21 (November 12, 2024)

- chore: polish blocklet screenshots
- style: UI improvement(#1224)
- feat: improve the quality of the preview image

## 0.14.20 (November 12, 2024)

- feat: dispaly all capabilities info(#1212)
- feat: add demo for 'Copy Install URL' menu(#1139)
- feat: add a friendly hint for adding components(#1139)
- chore: update screenshot(#1185)
- fix: update the DID dialog title(#1232)

## 0.14.19 (November 07, 2024)

- refactor: use common verification method validate the logo/screenshots(#1189)
- feat: add a content check for uploaded resources(#1185)

## 0.14.18 (November 01, 2024)

- chore: update screenshots(#1224)
- style: update the blocklet hover style(#1224)

## 0.14.17 (October 31, 2024)

- fix: displays the category corresponding to the current language(#1216)
- style: fixed the issue that screenshots were incomplete on mobile(#1217)
- fix: support close the preview dialog when the masking is clicked
- fix: remove the html tag in the title and some ui issue(#1125)
- fix: just run one tips when the comment tab is empty(#1122)

## 0.14.16 (October 31, 2024)

- feat: support tracking pageView and events for GA

## 0.14.15 (October 30, 2024)

- feat: encourage users to leave comments(#1197)
- fix: update the tab title when the route change(#1211)
- feat: display the become a developer url(#1165)
- feat: remove useless ui
- chore: update the issue template
- feat: display the official icon in the detail page(#1189)
- refactor: remove useless code (#1189)
- feat: add official icon for the blocklet(#1189)
- fix: display the user info form url's did(#1208)
- chore(deps): update vite-plugin-blocklet

## 0.14.14 (October 25, 2024)

- feat: close the preview dialog when the mask is closed(#1204-1)
- fix: display the profile info about the query did(#1206)
- feat: navigate to user profile page when the author label is clicked(#1205)
- feat: add resource did filter tag for list page(#1191)
- feat: update the filter tag of author(#1204-2)

## 0.14.13 (October 23, 2024)

- fix: fix the extensions display issue(#1191)
- feat: display the extensions of blocklet detail page(#1191)
- feat: support just filter by sourceDid or sourceType(#1191)
- feat: should display the resource dependences blocklet(#1191)
- feat: directly return to homepage when the back button of detail page is clicked(#1098)
- feat: should display pointer when the cursor hover on the banner(#1098)
- feat: update the toast style(#1193)
- fix: recovery the success/error theme color with default(#1187)
- fix: remove "undefined" text from the list result(#1188)
- feat: support search resource blocklet in the search box(#1190)
- refactor: change dependencies title and add a description for it(#1192)

## 0.14.12 (October 23, 2024)

- fix(store): should add component prefix in access config command

## 0.14.11 (October 22, 2024)

- feat: improve compatibility and remove transparency effects(#1183)
- feat: update the no results translation(#1182)
- fix: get the latest version of blocklet(#1181)
- feat: show the skeleton when the explore data is loading(#1098)
- feat: change capabilities to Composable(#1098)
- feat: show the correct mouse style when the mouse hover to the picture(#1159)
- feat: support for scrolling full with of container(#1098)

## 0.14.10 (October 18, 2024)

- feat: update peer dependence(#1098)

## 0.14.9 (October 18, 2024)

- feat: update the screenshots(#1098)
- feat: update the translation(#1139)
- feat: update logo src timestamp(#1160)
- feat: add back button for the detail page(#1154)
- feat: showing the loading status when the Img loading(#1146)
- style: update the slide duration of banner in mobile(#1098)

## 0.14.8 (October 17, 2024)

- feat: update the comment dialog UI(#1098)
- feat: remove public instance tab and adding missed prefix of url(#1160)
- feat: loading ico with lastPublishedAt query(#1160)
- feat: support navigate the blocklet detail when the banner blocklet is clicked(#1143)
- feat: eliminate XSS hazards(#1171)
- feat: refactor the image preview function(#1172)
- style: update the container button position(#1153)
- feat: update the query list logic and ui(#1163)
- refactor: refactor list component(#1169)
- style: update the markdown style of h1/h2(#1167)
- refactor: refactor the searchbox loading logic(#1169)
- feat: add mobile search box and loading status(#1169)
- feat: update search box style and move to header(#1169)
- fix: fetch data when the did changed(#1168)

## 0.14.7 (October 14, 2024)

- feat: add 'copy install url' menu item(#1098)
- fix: filter the self component(#1141)
- feat: modify the search box position(#1098)
- feat: replace autocomplate component with mui(#1133)
- refactor: remove useless height setting(#1132)
- refactor: defined some theme in the store list(#1130)
- fix: fix the package size display error issue(#1130)
- style: update the error color(#1142)
- refactor: replace the Link component from router(#1142)
- style: display the link underline always(#1136)
- fix: just query blocklets when it has user did(#1150)

## 0.14.6 (October 10, 2024)

- style: mutiple ui update
- feat: support quickly opening the write comment dialog(#1098)
- refactor: replace with correct api instance(#1098)
- fix: display QRCode when the Blocklet DID clicked(#1115)
- feat: add store profile page(#1098)
- feat: display the author's name as much as possible(#1098)

## 0.14.5 (October 09, 2024)

- feat: remove blocklet count limit for the list query(#1098)
- feat: set default value of layout.explore with false(#1098)
- feat: skip the gif imageFilter function(#1098)
- fix: showing the condition of author filter(#1098)

## 0.14.4 (October 09, 2024)

- refactor: resize the explore banner image display(#1098)
- refactor: support query did for the v2 blocklets query(#1098)
- fix: support csrf verify(#1098)
- chore: update axios version(#1098)

## 0.14.3 (October 08, 2024)

- fix: fixed the issue that the file was ingested in the wrong way(#1098)

## 0.14.2 (October 08, 2024)

- refactor: add imageFilter for the images(#1098)
- fix: fix the query param value(#1098)
- feat: update the e2e test(#1098)
- refactor: refactor the img to ux/Img(#1098)
- refactor: just refactor with comment(#1098)
- refactor: replace qs with ufo(#1098)
- feat: add missed translation(#1098)
- refactor: extract the topNQuery method(#1098)
- feat: update version(#1098)
- feat: update the dependencies
- feat: fix the tabs translateion failed issue(#1098)
- feat: add missed translation text(#1098)
- feat: add view all action for the Blocklet You May Need(#1098)
- feat: auto hidden the button when the container size change(#1098)
- feat: auto dispaly the no comment placeholder when the comment is empty(#1098)
- feat: add demo and support icon for the baseinfo(#1098)
- feat: add launch button(#1098)
- feat: replace snackbar with toast(#1098)
- feat: add image preview(#1098)
- feat: binding the event for the more action button (#1098)
- feat: add other tab UI(#1098)
- feat: add mobile ui for blocklet info tab(#1098)
- fix: eliminate possible error (#1098)
- feat: displays the blocklets related to category(#1098)
- feat: displays the blocklets related to author(#1098)
- feat: add api for the relate author/category blocklet(#1098)
- feat: replace button with common TextButton(#1098)
- refactor: move all components of info tab to info folder(#1098)
- feat: add version history tab change(#1098)
- feat: display author icon for the meta detail(#1098)
- feat: meta detail info for the blocklet detail page(#1098)
- feat: show dependence blocklet with horizontal container(#1098)
- feat: add comment/version/dependence component(#1098)
- feat: add blocklet info api for the detail page(#1098)
- feat: add readme component(#1098)
- feat: add screenshots component(#1098)
- feat: add blocklet detail page(#1098)

## 0.14.1 (October 08, 2024)

- feat(security): support csrf defense mechanism

## 0.14.0 (October 02, 2024)

- fix: fix display total error issue(#1098)
- fix: format the screenshot url(#1098)

## 0.13.40 (October 02, 2024)

- fix: just get the top 4 data(#1098)
- style: fixed the issue that the scrollbar of list flickered(#1098)
- feat: update the filter logic and ui(#1098)
- feat: just search blocklet with keyword for the search bar (#1098)
- feat: add 'All' category to display all blocklets (#1098)
- fix: use meilisearch query explore data (#1098)

## 0.13.39 (October 02, 2024)

- feat: update dependence(#1098)
- refactor: use common method set request header(#1098)
- refactor: update the api path(#1098)
- style: update the blocklet border with shadow (#1098)
- style: update the shadows config (#1098)
- feat: add action for the explore button(#1098)
- feat: add action for the explore button(#1098)
- feat: impalement the explore page api(#1098)
- feat: display banner info with api and preference(#1098)
- feat: add 'api/blocklets/dids' for list blocklet by did(#1098)
- feat: add mobile for explore banner(#1098)
- feat: add explore banner(#1098)
- refactor: refactor the folder structure(#1098)
- fix: auto clean payment filter(#1098)
- feat: add search result page ui(#1098)
- feat: update the list UI(#1098)
- feat: add filter ui part(#1098)
- feat: change the theme main color(#1098)
- feat: add Aside component(#1098)
- feat: add IconButton(#1098)
- feat: add search bar(#1098)
- refactor: refactor filter with ts(#1098)
- fix: fix the copy failed issue(#1098)
- feat: add translation for explore page(#1098)
- feat: integrate the mock api for explore page(#1098)
- chore: add ts lint for the list package(#1098)
- feat: add explore page ui(#1098)

## 0.13.38 (October 02, 2024)

- fix(core): avoid duplicate notify when store and blocklet owner are same #1109

## 0.13.37 (September 29, 2024)

- feat: support defined currency by the preferences setting

## 0.13.36 (September 29, 2024)

- fix(ux): should not reload when login/logout on join

## 0.13.35 (September 29, 2024)

- chore: update search kit

## 0.13.34 (September 27, 2024)

- feat: update all dependencies

## 0.13.33 (September 26, 2024)

- feat: update the lint config(#1098)

## 0.13.32 (September 25, 2024)

- feat: render blocklet with blockletV2(#1098)
- refactore: refactor launch-button with ts(#1098)
- refactor: refactor jsx to tsx(#1098)
- fix: fix the local missed zh translation(#1102)

## 0.13.31 (September 23, 2024)

- feat: update dependencies

## 0.13.30 (September 20, 2024)

- fix: support the download url contain version info(#9840)

## 0.13.29 (September 19, 2024)

- feat: add blocklet resource type column and filter action(#1095)

## 0.13.28 (September 13, 2024)

- feat: blocklet render with serverVersion(#1091)
- feat: show all blocklet for the blocklet store no matter the blocklet server version (#1091)

## 0.13.27 (September 13, 2024)

- fix: missing the blocklet name when update payment link (#1077)

## 0.13.26 (September 12, 2024)

- fix: missing the blocklet name when creating a payment link (#1077)

## 0.13.25 (September 11, 2024)

- feat: update the document links

## 0.13.24 (September 11, 2024)

- feat: display auto publish icon for blocklet status in table (#885)

## 0.13.23 (September 10, 2024)

- fix: auto focus on the filter input when the search content is deleted (#1062, #917)

## 0.13.22 (September 10, 2024)

- fix(ui): the filter icon is displayed in the center

## 0.13.21 (September 10, 2024)

- fix(ui): just modify the detail page launch button width

## 0.13.20 (September 09, 2024)

- fix(ui): adjust launch/copy button width (#1079)

## 0.13.19 (September 02, 2024)

- chore: deprecate old auth service name

## 0.13.18 (August 15, 2024)

- fix(blocklet-store): safe to check is blocklet free or not

## 0.13.17 (August 15, 2024)

- fix(blocklet-store): rename action-button classname to avoid duplicate naming

## 0.13.16 (August 13, 2024)

- chore(blocklet-store): launch-button use split button

## 0.13.15 (August 12, 2024)

- chore: update search-kit

## 0.13.14 (July 30, 2024)

- chore(blocklet-store): use did in `blocklet add` command
- chore(blocklet): polish developer passport revoked message

## 0.13.13 (July 25, 2024)

- fix(blocklet-store): copy install url should contain prefix

## 0.13.12 (July 24, 2024)

- fix(blocklet-server): fix joinURL not working with url.search error

## 0.13.11 (July 23, 2024)

- fix(blocklet-store): fix detail page component view-link
- fix(blocklet-store): polish detail page style

## 0.13.10 (July 23, 2024)

- fix(blocklet-store): fix blocklet history blocklet.json data
- fix(blocklet-store): add `--profile` in create token dialog
- chore(blocklet-store): polish create success & delete success toast message
- fix(blocklet-store): blocklet detail description support click more & hide

## 0.13.9 (July 09, 2024)

- chore: update deps

## 0.13.8 (July 03, 2024)

- feat: post-message when connect success or error

## 0.13.7 (July 02, 2024)

- fix: window close support wallet

## 0.13.6 (July 02, 2024)

- fix(ux): failed to parse components when mount no relative path

## 0.13.5 (July 02, 2024)

- feat(ux): connect studio close on success

## 0.13.4 (June 27, 2024)

- fix(api): blocklet upload/publish failure because isolation #1050
- fix(ux): better error when connect to invited without passport #1051
- feat(ux): support show source in connect pages

## 0.13.3 (June 26, 2024)

- chore(deps): update deps
- fix(locale): update list placeholder locale

## 0.13.2 (June 26, 2024)

- fix: can not launch add copied button
- fix: parse old price
- feat: update payment-key product logo
- feat: change image filter size

## 0.13.1 (June 26, 2024)

- chore(deps): update deps
- chore(list): polish search-list autocomplete placeholder
- fix(store): fix search-list endpoint

## 0.13.0 (June 25, 2024)

- chore: official v0.13.0 release

## 0.12.118 (June 24, 2024)

- fix(api): set correct blocklet source when upload from studio

## 0.12.117 (June 23, 2024)

- chore: bump deps to latest

## 0.12.116 (June 20, 2024)

- fix(api): update wallet version requirement config
- fix(api): blocklet env not responsive

## 0.12.115 (June 19, 2024)

- chore: ensure apps working in isolation mode

## 0.12.114 (June 14, 2024)

- fix(core): changelog not persisted on blocklet publish

## 0.12.113 (June 13, 2024)

- chore(deps): bump deps to latest
- fix(api): initial publish for blocklet is broken

## 0.12.112 (June 12, 2024)

- chore: update deps

## 0.12.111 (June 05, 2024)

- fix(list): hasNextPage should use current data length compare data.total

## 0.12.110 (June 05, 2024)

- fix(ci): setup pnpm before node

## 0.12.109 (June 05, 2024)

- chore(store): title should not be clip in y-axis
- chore(ci): update ci config

## 0.12.108 (June 05, 2024)

- fix(api): should check wallet version for new stake

## 0.12.107 (June 04, 2024)

- fix(ci): fix ci bundle path

## 0.12.106 (June 04, 2024)

- fix(ci): make store kit as private npm package

## 0.12.105 (June 04, 2024)

- chore(store-kit): use small button in list
- chore(deps): upgrade to pnpm 9.x
- chore(store-kit): polish docs & images
- chore(store-kit): replace logo.png
- feat: rebrand mini-store -> store-kit

## 0.12.104 (June 04, 2024)

- chore: better blocklet studio connect ux
- feat: block blocklet on publish when stake revoked
- feat: revoke passport or blocklet when stake revoked
- feat: support publish staking for blocklet
- feat: make paid blocklets toggle work
- chore: move environments to preferences
- chore: refactor blocklet preference form

## 0.12.103 (May 30, 2024)

- fix(list): page should reset after filters change

## 0.12.102 (May 30, 2024)

- fix(store): typo in blocklet-info

## 0.12.101 (May 30, 2024)

- feat(mini-store): support custom button text
- chore(store): deprecated blocklet detail author field
- chore(mini-store): support seamless refresh after add-component complete
- fix(mini-store): reload page should keep chooseTag
- chore(store): available to search all bundles, ignore public
- feat(mini-store): better action button in store-list
- feat(mini-store): support hide tags
- fix(list): better pagination while filter data

## 0.12.100 (May 25, 2024)

- chore(mini-store): fix ci bundle

## 0.12.99 (May 25, 2024)

- fix(ci): pnpm deps caused publish failure

## 0.12.98 (May 25, 2024)

- feat(app): add prefs config for mini store
- feat(app): add mini store blocklet
- feat(ux): polish @blocklet/list styling and customization

## 0.12.97 (May 22, 2024)

- fix(core): support connect studio for brand new user

## 0.12.96 (May 22, 2024)

- feat: increase developer max stake amount to 1000

## 0.12.95 (May 22, 2024)

- fix(api): stake and join is broken
- fix(ux): should not auto close in did-connect error
- fix(ux): join page should reload on login/logout

## 0.12.94 (May 21, 2024)

- feat: support load monikers by connect-url

## 0.12.93 (May 22, 2024)

- feat(api): return store appId on connect-studio

## 0.12.92 (May 20, 2024)

- feat: support configure staking amount and revoke waiting period
- feat: support get developer passport with staking
- chore: cleanup developer nft and apply related logic
- chore: deprecate logo and maintainer settings from store

## 0.12.91 (May 14, 2024)

- fix: handle service errors
- feat: fix some cache and react table key warring
- feat: add nft factory and pricing

## 0.12.90 (May 13, 2024)

- feat: support switch app in connect-cli & gen-key-pair

## 0.12.89 (April 29, 2024)

- chore: update deps

## 0.12.88 (April 23, 2024)

- feat(resource): add show resources filter

## 0.12.87 (April 11, 2024)

- chore: bump payment kit components to latest
- chore: disable notification on blocklet upload

## 0.12.86 (April 11, 2024)

- feat(core): support donation on blocklet detail

## 0.12.85 (April 07, 2024)

- chore: update deps

## 0.12.84 (April 07, 2024)

- chore(deps): bump interval deps related to latest

## 0.12.83 (April 03, 2024)

- fix(ux): incorrect blocklet developer on detail page

## 0.12.82 (April 03, 2024)

- fix(api): can not publish brand new blocklet #1003

## 0.12.81 (March 29, 2024)

- chore: bump vite-plugin-blocklet to latest

## 0.12.80 (March 27, 2024)

- feat(core): support squash change logs when publish to new store

## 0.12.79 (March 25, 2024)

- chore: did-component show QRCode
- chore: fix lint error
- chore: update deps

## 0.12.78 (March 21, 2024)

- chore: update deps

## 0.12.77 (March 20, 2024)

- chore(locale): update monthlyDownloads locale
- chore(deps): update @blocklet/discuss-kit
- chore(deps): update deps
- fix: algolia clear button should remove drawer modal after clear input content

## 0.12.76 (March 15, 2024)

- fix(ux): typo fee -> free

## 0.12.75 (March 14, 2024)

- feat(schema): deprecate list support for components.source.store

## 0.12.74 (March 07, 2024)

- chore: update deps

## 0.12.73 (March 07, 2024)

- fix(api): download stats should not increment on head requests

## 0.12.72 (February 29, 2024)

- chore: bundle use compact

## 0.12.71 (February 08, 2024)

- chore(deps): update deps

## 0.12.70 (February 06, 2024)

- fix: upload blocklet with special mountPoint failed

## 0.12.69 (January 31, 2024)

- fix(ui): duplicate components in detail page

## 0.12.68 (January 29, 2024)

- chore(deps): update deps
- fix: return latest version by default in blocklet.json url

## 0.12.67 (January 24, 2024)

- chore: cleanup docs related code/config/doc

## 0.12.66 (January 23, 2024)

- chore: bump deps to latest beta

## 0.12.65 (January 12, 2024)

- fix: add version on img url queryString

## 0.12.64 (January 12, 2024)

- chore: update deps
- fix: polish connect-sli & gen-key-pair page layout

## 0.12.63 (January 09, 2024)

- chore: update deps

## 0.12.62 (December 29, 2023)

- fix: build blocklet-store failed

## 0.12.61 (December 28, 2023)

- feat(resource): update resource format in search list and detail page

## 0.12.60 (December 20, 2023)

- chore: update deps

## 0.12.59 (December 18, 2023)

- feat: support filter by resource creator

## 0.12.58 (December 14, 2023)

- feat: show resource type in detail page

## 0.12.57 (December 05, 2023)

- feat: pre validate before upload to improve ux

## 0.12.56 (December 05, 2023)

- chore: update deps

## 0.12.55 (December 03, 2023)

- chore: update deps

## 0.12.54 (November 28, 2023)

- chore: update deps

## 0.12.53 (November 16, 2023)

- chore: update deps

## 0.12.52 (November 09, 2023)

- chore: update deps

## 0.12.51 (November 06, 2023)

- chore: update deps

## 0.12.50 (November 03, 2023)

- fix: sometimes blocklet list can be rendered only before the category is fetched

## 0.12.49 (November 02, 2023)

- feat: support filtering blocklet by resource type

## 0.12.48 (October 30, 2023)

- chore: update deps

## 0.12.47 (October 27, 2023)

- chore: update deps

## 0.12.46 (October 23, 2023)

- chore: update deps

## 0.12.45 (September 28, 2023)

- chore: update deps
- fix: blocklet-list responsive optimization
- chore: polish genKeyPair success description
- fix: disable autoConnect in publish & autoPublish

## 0.12.44 (September 26, 2023)

- chore: polish upload button

## 0.12.43 (September 24, 2023)

- feat: support uploading blocklet from page

## 0.12.42 (September 19, 2023)

- chore: update deps

## 0.12.41 (September 16, 2023)

- chore: bump deps to latest

## 0.12.40 (September 12, 2023)

- chore: update session manager nav items

## 0.12.39 (September 12, 2023)

- chore: update @blocklet/sdk

## 0.12.38 (September 12, 2023)

- chore: update deps

## 0.12.37 (September 06, 2023)

- chore: bump deps to latest

## 0.12.36 (September 06, 2023)

- chore: update deps

## 0.12.35 (September 04, 2023)

- chore: update deps

## 0.12.34 (August 24, 2023)

- feat: support open graph for blocklet detail page

## 0.12.33 (August 24, 2023)

- chore: update deps

## 0.12.32 (August 21, 2023)

- chore: update deps

## 0.12.31 (August 16, 2023)

- chore: update deps

## 0.12.30 (August 12, 2023)

- chore: bump deps to latest

## 0.12.29 (August 11, 2023)

- fix(cache): blocklet logos should include publish time in cache key
- feat(seo): add category pages into sitemap

## 0.12.28 (August 11, 2023)

- feat(seo): support sitemap for blocklets

## 0.12.27 (August 03, 2023)

- fix: remove docs relate ci
- fix: add `@iconify/iconify` temporary

## 0.12.26 (August 03, 2023)

- chore: update deps

## 0.12.25 (July 25, 2023)

- chore: update deps

## 0.12.24 (July 25, 2023)

- chore: bump deps to latest

## 0.12.23 (July 25, 2023)

- chore: use new blocklet plugin

## 0.12.22 (July 25, 2023)

- feat: offload brotli/gzip compression to server

## 0.12.21 (July 25, 2023)

- chore: update deps
- fix: async-session request should not have another page loading

## 0.12.20 (July 22, 2023)

- chore: bump deps to latest

## 0.12.19 (July 20, 2023)

- feat: use image resize service

## 0.12.18 (July 20, 2023)

- feat: use inline blocklet.js

## 0.12.17 (July 20, 2023)

- chore: update deps

## 0.12.16 (July 20, 2023)

- feat: add assets path to router cache

## 0.12.15 (July 17, 2023)

- chore: update deps

## 0.12.14 (July 17, 2023)

- chore: update deps

## 0.12.13 (July 14, 2023)

- fix: deps not bumped to latest

## 0.12.12 (July 14, 2023)

- feat(nft): use nft did to derive display color

## 0.12.11 (July 13, 2023)

- chore: update deps

## 0.12.10 (July 10, 2023)

- chore: update deps

## 0.12.9 (July 07, 2023)

- feat: use new nft display

## 0.12.8 (July 04, 2023)

- feat: add blocklet did on detail
- fix: use Toast from ux lib
- fix: polish category locale
- chore: bump deps
- chore: deprecate blocklet info context

## 0.12.7 (June 30, 2023)

- chore: update deps
- fix: page focus cause page refresh

## 0.12.6 (June 26, 2023)

- chore: support pv tracking
- chore: bump deps to latest
- fix: forceConnected set to false

## 0.12.5 (June 20, 2023)

- chore: update deps

## 0.12.4 (June 18, 2023)

- chore: bump deps and support blocklet.yml#pageGroup

## 0.12.3 (June 14, 2023)

- feat: display blocklet components on detail

## 0.12.2 (June 13, 2023)

- chore: bump deps to latest

## 0.12.1 (June 12, 2023)

- chore: increase ci max_old_space_size
- chore: change _.mjs -> _.es.js

## 0.12.0 (June 12, 2023)

- chore: polish scripts
- feat: support change launchUrl in client
- chore: show discuss-kit comments component's connect button
- chore: disable validateName while edit blocklet detail
- chore: polish build opt
- chore: suspense tab-comments
- chore: compatible storybook scripts
- chore: update ci actions version
- feat: use vite replace craco

## 0.11.28 (May 29, 2023)

- chore: bump deps to latest

## 0.11.27 (May 24, 2023)

- fix: blocklet not found error
- chore: bump deps to latest

## 0.11.26 (May 15, 2023)

- fix: lint errors

## 0.11.25 (May 15, 2023)

- chore: bump and cleanup deps

## 0.11.24 (May 05, 2023)

- fix: use beta blocklet cli

## 0.11.23 (May 05, 2023)

- chore: bump deps to latest

## 0.11.22 (April 24, 2023)

- fix: use latest wallet when create nft factory

## 0.11.21 (April 24, 2023)

- chore: polish pre-start logic and log
- chore(ci): skip deploy to staging node

## 0.11.20 (April 24, 2023)

- fix: do not create nft factory when run in trust mode

## 0.11.19 (April 24, 2023)

- chore: bump deps to latest

## 0.11.18 (April 11, 2023)

- chore: deprecate pages by xmark2

## 0.11.17 (April 10, 2023)

- chore: update readme for api and developer
- chore: use blocklet preferences instead of config manager
- chore: use window.blocklet instead of window.env
- chore: bump deps to latest
- fix: event emit signature
- fix: typo x-server-public-key

## 0.11.16 (April 03, 2023)

- fix: paid blocklet need show it's price (fixes #903)

## 0.11.15 (April 03, 2023)

- fix: replace \_.orderBy with js sort function

## 0.11.14 (April 02, 2023)

- chore: rename file suffix `js` -> `jsx`
- feat: get blocklet list & detail by serverVersion & storeVersion condition
- fix: smart check did-comments
- chore: add requirements.abtnode

## 0.11.13 (March 30, 2023)

- chore: update ci setting

## 0.11.12 (March 30, 2023)

- chore: update deps
- chore: update websites build base

## 0.11.11 (March 29, 2023)

- fix: all of appIds should in truster issuers when verify purchase

## 0.11.10 (March 23, 2023)

- fix: version of @arcblock/did-connect should be 2.5.14

## 0.11.9 (March 22, 2023)

- fix: blocklet store should be a component

## 0.11.8 (March 21, 2023)

- chore: update deps

## 0.11.7 (March 20, 2023)

- chore: update deps to latest

## 0.11.6 (March 13, 2023)

- chore: trigger release

## 0.11.5 (March 13, 2023)

- chore: update ux to latest

## 0.11.4 (March 02, 2023)

- fix: update prefix of static source

## 0.11.3 (February 28, 2023)

- chore: update deps to latest

## 0.11.2 (February 21, 2023)

- fix: lock @nedb/core == 2.1.3

## 0.11.1 (February 21, 2023)

- fix: webpack need "crypto", "stream" alias

## 0.11.0 (February 20, 2023)

- chore: fix reviews
- fix: add blocklet in web
- chore: fix package.json
- chore: add locale for did-connect page
- feat: support custom create blocklet-did moniker
- feat: suppot create multi blocklet-did in one did-connect
- chore: complete publish & auto-publish blocklet (didVersion == 2)
- feat: use keyPair & sign-delegation
- feat: add did-connect for get blocklet-did from wallet

## 0.10.50 (February 08, 2023)

- Merge branch 'master' into hox-fix-mc
- chore: update deps
- chore: update xmark
- fix: deps
- fix: multiformats version
- chore: change default chain host to main
- fix: e2e test env
- chore: update
- chore: update
- chore: update version
- chore: update deps
- chore: support catch error for send user

## 0.10.49 (February 08, 2023)

- fix: blocklet list fetch error data on switch filter

## 0.10.48 (February 06, 2023)

- [skip ci]: update config.yml
- [skip ci]: remove url
- [skip ci]: remove useless files (#876)
- [skip ci]: update template

## 0.10.47 (December 26, 2022)

- chore: bump deps to latest

## 0.10.46 (December 26, 2022)

- chore: use latest xmark

## 0.10.45 (December 24, 2022)

- fix: wrong import name

## 0.10.44 (December 24, 2022)

- chore: bump deps to latest

## 0.10.43 (December 08, 2022)

- chore: update deps

## 0.10.42 (December 06, 2022)

- chore: use latest @blocklet/discuss-kit

## 0.10.41 (December 06, 2022)

- fix: docs navigation

## 0.10.40 (December 05, 2022)

- chore: update deps

## 0.10.39 (December 05, 2022)

- chore: update navigation id

## 0.10.38 (December 02, 2022)

- fix: error state is not updated when switching endpoint

## 0.10.37 (November 23, 2022)

- fix: link to the wrong registration page when registering as a developer

## 0.10.36 (November 21, 2022)

- feat: support client gas payer headers

## 0.10.35 (November 18, 2022)

- chore: use latest @did-comment/react

## 0.10.34 (November 18, 2022)

- chore: support for degraded use of base-search

## 0.10.33 (November 15, 2022)

- chore: use latest @did-comment/react
- fix: api incompatibility introduced by @blocklet/meta

## 0.10.32 (November 04, 2022)

- chore: remove 'playground' from dashboard navigation

## 0.10.31 (November 04, 2022)

- chore: use latest did-comments

## 0.10.30 (November 03, 2022)

- fix: auto publish faild on upload free blocklet
- fix: While the blocklet is still in draft state, the state of the paid component has changed

## 0.10.29 (November 03, 2022)

- chore: use latest did-comments

## 0.10.28 (October 26, 2022)

- fix: nft purchase certificate time display error
- chore: update meilisearch components

## 0.10.27 (October 25, 2022)

- chore: autocomplete search improvements

## 0.10.26 (October 24, 2022)

- chore: add log for downloadToken

## 0.10.25 (October 22, 2022)

- chore: use latest did-comment

## 0.10.24 (October 21, 2022)

- chore: remove link status on public-instance

## 0.10.23 (October 20, 2022)

- fix: home page sticky not work

## 0.10.22 (October 19, 2022)

- chore: update deps to latest

## 0.10.21 (October 19, 2022)

- chore: supoort search keyword highlight

## 0.10.20 (October 18, 2022)

- feat: optimize store autocomplete search interactions

## 0.10.19 (October 16, 2022)

- fix: rename admin path to console

## 0.10.18 (October 14, 2022)

- chore: update did-comment to latest

## 0.10.17 (October 14, 2022)

- chore: polish header logo

## 0.10.16 (October 12, 2022)

- fix: apply list error on not user

## 0.10.15 (October 09, 2022)

- chore: category support multiple locales
- chore: addComponent locales
- chore: support config language

## 0.10.14 (October 08, 2022)

- chore: e2e-test
- chore: optimize management interface

## 0.10.13 (September 27, 2022)

- chore: bump deps to latest

## 0.10.12 (September 23, 2022)

- chore: resolve conflicts
- chore: add config `github` in docs-site
- chore: update deps
- feat: add support doc search for docs site

## 0.10.11 (September 23, 2022)

- chore: UI and dashboard navigation improvements

## 0.10.10 (September 22, 2022)

- chore: improve developer registration & nav access control logic

## 0.10.9 (September 20, 2022)

- chore: update deps
- chore: coverage qq-browser

## 0.10.8 (September 16, 2022)

- chore: use latest blocklet ui dashboard & adjust nav configs

## 0.10.7 (September 09, 2022)

- chore: add support display component price split contract

## 0.10.6 (September 09, 2022)

- chore: improve developer authz by using developer passport

## 0.10.5 (September 06, 2022)

- chore: add sentry config

## 0.10.4 (September 06, 2022)

- chore: update deps
- fix: remove footer border-bottom for data-table

## 0.10.3 (September 06, 2022)

- chore: add smoke test for storybook

## 0.10.2 (September 05, 2022)

- fix: page site not working

## 0.10.1 (September 05, 2022)

- chore: the prompt after blocklet auto-publishing success

## 0.10.0 (September 01, 2022)

- feat: support blocklet with paid child component

## 0.9.35 (September 01, 2022)

- fix: should use did-comment from production store

## 0.9.34 (September 01, 2022)

- chore: replace ux dashboard with blocklet-ui dashboard

## 0.9.33 (August 31, 2022)

- fix: position sticky not working

## 0.9.32 (August 30, 2022)

- fix: circular object caused crash on logging

## 0.9.31 (August 29, 2022)

- chore: support autofocus
- fix re-render issue

## 0.9.30 (August 29, 2022)

- chore: adjust icon size for header addons

## 0.9.29 (August 26, 2022)

- fix: copywriting errors

## 0.9.28 (August 26, 2022)

- chore: add notification send to user when block/unblock blocklet
- chore: add support input disable blocklet reason
- fix: login page jumping error

## 0.9.27 (August 26, 2022)

- feat: support hotkey for search box

## 0.9.26 (August 25, 2022)

- chore: update react-scripts to v5

## 0.9.25 (August 24, 2022)

- chore: use latest xmark for header connect

## 0.9.24 (August 24, 2022)

- chore: update blocklet-list

## 0.9.23 (August 23, 2022)

- fix: some bug for blocklet-list
- chore: replace @blocklet/logger
- chore: upgrade ahooks

## 0.9.22 (August 22, 2022)

- fix: logo display in xmark modules

## 0.9.21 (August 22, 2022)

- chore: support i18n for website navigation

## 0.9.20 (August 20, 2022)

- chore: add onSearchSelect explame for storybook
- chore: deprecate serverUrl for blocklet list

## 0.9.19 (August 20, 2022)

- chore: update deps to latest
- feat: support onSearchSelect for blocklet list component

## 0.9.18 (August 19, 2022)

- fix: add component error

## 0.9.17 (August 19, 2022)

- chore: update deps to latest

## 0.9.16 (August 18, 2022)

- fix: autocomplete error
- chore: adding e2e-test for autocomplete

## 0.9.15 (August 18, 2022)

- chore: enable remote deploy in ci
- chore: update xmark and use arcblock theme

## 0.9.14 (August 18, 2022)

- fix: server store page to store detail

## 0.9.13 (August 17, 2022)

- fix: release script
- chore: tune navigation

## 0.9.12 (August 17, 2022)

- chore: update meilisearch settings

## 0.9.11 (August 17, 2022)

- chore: bump deps to latest safely
- chore: add store pages and docs

## 0.9.10 (August 17, 2022)

- fix: multiple origin cache

## 0.9.9 (August 16, 2022)

- fix: failed to store bundle

## 0.9.8 (August 16, 2022)

- chore: support autocomplete for blocklet-list

## 0.9.7 (August 16, 2022)

- fix: /api/blocklets.json return 404

## 0.9.6 (August 13, 2022)

- chore: update version

## 0.9.5 (August 12, 2022)

- chore: update migration
- fix: failed to meilisearch update

## 0.9.4 (August 11, 2022)

- chore: add manage meilisearch api for admin

## 0.9.3 (August 11, 2022)

- chore: update react-router to v6

## 0.9.2 (August 09, 2022)

- fix: 0.9.1 migration script

## 0.9.1 (August 02, 2022)

- chore: support meilisearch with child component

## 0.9.0 (August 02, 2022)

- chore: update all deps to latest safely

## 0.8.66 (August 01, 2022)

- chore: remove meilisearch
- chore: support sticky side ande header on blocklet-list

## 0.8.66 (July 28, 2022)

- chore: support sticky side ande header on blocklet-list

## 0.8.65 (July 21, 2022)

- chore: meilisearch runs as a child of the blocklet store

## 0.8.64 (July 21, 2022)

- fix: disable automatic posting if the price has changed

## 0.8.63 (July 20, 2022)

- chore: update deps
- fix: ensure uniq vcId when purchase blocklet

## 0.8.62 (July 12, 2022)

## 0.8.61 (July 11, 2022)

- fix(deps): bump chain sdk to latest

## 0.8.60 (July 07, 2022)

- chore: support fix height for blocklet list

## 0.8.59 (July 06, 2022)

- test(e2e): add verify-purchase-paid-blocklet e2e test

## 0.8.58 (July 05, 2022)

- fix: return blocklet readme in standalone api

## 0.8.57 (July 04, 2022)

- fix: cloudfront-shield should be a private package

## 0.8.56 (July 04, 2022)

- feat: support manage public instance

## 0.8.55 (July 04, 2022)

- feat: support for using AWS lambda to verify paid blocklet

## 0.8.54 (July 03, 2022)

- chore: re-deploy to test-store

## 0.8.53 (July 03, 2022)

- fix: slow download of files from store

## 0.8.52 (July 02, 2022)

- fix: slow download of files from store

## 0.8.51 (June 27, 2022)

- ci: sleep 60s after deployed to test server

## 0.8.50 (June 27, 2022)

- fix: resize the logo

## 0.8.49 (June 27, 2022)

- ci: move "deploy" to front of "upload"

## 0.8.48 (June 27, 2022)

- chore: update ux deps and improve footer layout

## 0.8.47 (June 23, 2022)

- fix: verify purchase failed in android wallet

## 0.8.46 (June 22, 2022)

- fix: blocklet-list infinite scroll bug

## 0.8.45 (June 21, 2022)

- chore: improve admin-layout and page-layout

## 0.8.44 (June 21, 2022)

- chore: resolve eslint rules

## 0.8.43 (June 21, 2022)

- fix: nw in extraParams is optional

## 0.8.42 (June 21, 2022)

- feat: add downloadToken to did connect session

## 0.8.41 (June 20, 2022)

- fix(deps): incorrect resolution in root package.json

## 0.8.40 (June 17, 2022)

- feat: carry the signature of the server when downloading the paid blocklet

## 0.8.39 (June 16, 2022)

- feat: safely download paid apps

## 0.8.38 (June 15, 2022)

- chore: admins automatically become developers

## 0.8.37 (June 14, 2022)

- chore: reduce unused javaScript

## 0.8.36 (June 11, 2022)

- fix: store ux for bugbash

## 0.8.35 (June 10, 2022)

- chore: resolve mobile lighthouse optimization

## 0.8.34 (June 09, 2022)

- feat: catch error in blocklet-list

## 0.8.33 (June 07, 2022)

- feat: deploy storybook

## 0.8.32 (June 07, 2022)

- feat: support extraFilter for blocklet-list

## 0.8.31 (June 07, 2022)

- feat: replace mui-datatable to ux lib datatable

## 0.8.30 (June 07, 2022)

- chore: chunk file by router
- chore: remove unused resource

## 0.8.29 (June 06, 2022)

- fix: display favicon && large screen width ux

## 0.8.28 (June 02, 2022)

- chore: resolve blocklet-store ux

## 0.8.27 (June 02, 2022)

- chore: update eslint-config

## 0.8.26 (June 01, 2022)

- feat: comment run url to PR when e2e test failure

## 0.8.25 (June 01, 2022)

- chore: 30 days of blocklet download count

## 0.8.24 (May 31, 2022)

- chore: adjust details for ux
- fix: sort blocklet failed

## 0.8.23 (May 30, 2022)

- feat: limit blocklet bundle size

## 0.8.22 (May 28, 2022)

- chore(component): filter operation optimization for store homepage

## 0.8.21 (May 27, 2022)

- chore: resolve store ux details

## 0.8.20 (May 27, 2022)

- fix(api): upload failed when the logo does not exist

## 0.8.19 (May 27, 2022)

- feat(api): use README.md as a backup to blocklet.md

## 0.8.18 (May 27, 2022)

- fix: e2e-test for @blocklet/list

## 0.8.17 (May 26, 2022)

- chore: add support switch origin on storybook

## 0.8.16 (May 25, 2022)

- feat(component): support select components for @blocklet/list
- feat: support storybook for packages

## 0.8.15 (May 25, 2022)

- fix(approve developer): confirm dialog did not shut down properly

## 0.8.14 (May 25, 2022)

- feat(core): support multilingual blocklet.md when bundling

## 0.8.13 (May 25, 2022)

- chore(deps): bump chain and common deps to latest

## 0.8.12 (May 23, 2022)

- chore: support for working in blocklet-server

## 0.8.11 (May 23, 2022)

- feat(e2e): add user functions e2e test

## 0.8.10 (May 22, 2022)

- chore(deps): bump chain and common deps to latest

## 0.8.9 (May 21, 2022)

- chore: trigger new release

## 0.8.8 (May 20, 2022)

- feat: added support for blocklet add in details page

## 0.8.7 (May 20, 2022)

- fix: sort status update failed

## 0.8.6 (May 18, 2022)

- chore: use the blocklet-list component in the store
- feat: extract @blocklet/list package

## 0.8.5 (May 18, 2022)

- fix: ues hosted-git-info in api rather then browser, cause hosted-git-info only works good in nodejs

## 0.8.4 (May 18, 2022)

- chore: update mannual upload workflow

## 0.8.3 (May 17, 2022)

- fix: blocklet detail style invalidation

## 0.8.2 (May 17, 2022)

- chore: update blocklet component syntax

## 0.8.1 (May 16, 2022)

- feat(e2e): add backend management e2e test

## 0.8.0 (May 15, 2022)

- chore: upgrade to react v18 and mui v5
- chore: change api test data-dir

## 0.7.26 (May 13, 2022)

- chore: new design developer nft certified

## 0.7.25 (May 12, 2022)

- fix: blocklet detail display price

## 0.7.24 (May 12, 2022)

- chore: limit text length with css
- chore: limit blocklet price length

## 0.7.23 (May 11, 2022)

- feat: use NFT to apply for developers

## 0.7.22 (May 11, 2022)

- fix: get specified version blocklet.json failed

## 0.7.21 (May 09, 2022)

- fix: blocklet release workflow

## 0.7.20 (May 09, 2022)

- fix: blocklet bundling not working in monorepo
- chore: add missing readme

## 0.7.19 (May 09, 2022)

- chore: transform to monorepo

## 0.7.18 (May 07, 2022)

- feat: blocklet.md support reference local resource files

## 0.7.17 (May 06, 2022)

- chore: update meta info
- chore: complete header width size

## 0.7.16 (May 06, 2022)

- chore: optimize changelog ui

## 0.7.15 (May 06, 2022)

- chore: populate history change log by trigger new release

## 0.7.14 (May 05, 2022)

- chore: update deps
- chore: add log
- fix: getFormattedChangelog on auto publish

## 0.7.13 (May 05, 2022)

- chore: populate history change log by trigger new release

## 0.7.12 (May 05, 2022)

- chore: local test
- chore: resolve conflict
- feat: support view version changelog

## 0.7.11 (May 05, 2022)

- feat: improve wallet notification for blocklet store

## 0.7.10 (April 30, 2022)

- feat: display the created source in the blocklet

## 0.7.9 (April 29, 2022)

- fix: failed to find meta field

## 0.7.8 (April 28, 2022)

- feat: send notifications to wallet to enhance ux

## 0.7.7 (April 28, 2022)

- feat(workflow): add a version number check task in workflow

## 0.7.6 (April 26, 2022)

- update did comments

## 0.7.5 (April 26, 2022)

- feat: improve auto-publish process ux

## 0.7.4 (April 25, 2022)

- feat: support screenShoot view main photo
- chore: update did comments switch

## 0.7.3 (April 25, 2022)

- chore: fix publish failed on prod

## 0.7.2 (April 24, 2022)

- chore: show more field on blocklet detail

## 0.7.1 (April 24, 2022)

- chore: make e2e test more stable
- feat(publish blocklet): support config auto-publish blocklet

## 0.7.0 (April 23, 2022)

- chore: add e2e test case

## 0.6.28 (April 21, 2022)

- feat: support show file size

## 0.6.27 (April 21, 2022)

- chore: published auto close modal

## 0.6.26 (April 20, 2022)

- chore: size style for store vi system

## 0.6.25 (April 20, 2022)

- add did comments

## 0.6.24 (April 19, 2022)

- chore: support show draft meta on blocklet list

## 0.6.23 (April 19, 2022)

- fix(ui): hast covert to markdown

## 0.6.22 (April 19, 2022)

- fix(ui): replace dynamic import() with require()

## 0.6.21 (April 19, 2022)

- fix(ui): better github flavored markdown support

## 0.6.20 (April 16, 2022)

- fix: trigger release

## 0.6.19 (April 14, 2022)

- fix: fix updateSession is not a function error

## 0.6.18 (April 08, 2022)

- chore: update deps to latest

## 0.6.17 (April 07, 2022)

- chore(deps): bump chain and common deps to latest
- feat(security): support encrypt sensitive data when connect cli

## 0.6.16 (April 02, 2022)

- fix: sort by publishAt
- fix: #460 #466
- chore: add publish button

## 0.6.15 (April 02, 2022)

- chore: add faq about store development
- chore: refactor blocklet publish related code
- chore: remove useless env context
- fix: allow admin to become a developer

## 0.6.14 (April 01, 2022)

- chore: bump deps

## 0.6.13 (April 01, 2022)

- chore: update logo

## 0.6.12 (April 01, 2022)

- chore: size blocklet card for mobile

## 0.6.11 (March 31, 2022)

- chore: resolve conflict
- chore: update blocklet&&fix some bug

## 0.6.10 (March 31, 2022)

- chore: add manual deploy script

## 0.6.9 (March 31, 2022)

- upgrade arcblock/abtnode/ocap/blocklet deps to latest

## 0.6.8 (March 31, 2022)

- feat: ensure fuel during setup

## 0.6.7 (March 30, 2022)

- chore: update deps
- chore: update pull_request_template

## 0.6.6 (March 28, 2022)

- chore: replace nft issued by

## 0.6.5 (March 28, 2022)

- chore: fix nft-certificate did hash style
- chore: update deps

## 0.6.4 (March 26, 2022)

- chore: update display nft cache && vi
- chore: update deps

## 0.6.3 (March 24, 2022)

- chore: update vi system

## 0.6.2 (March 24, 2022)

- chore: get blocklet log by base64
- chore: complete new-paid-nft

## 0.6.1 (March 22, 2022)

- chore: detail launch blocklet

## 0.6.0 (March 21, 2022)

- chore: release v0.6.0

## 0.5.39 (March 18, 2022)

- chore: more than empty result
- chore: fix blocklet error on no meta field (#442)

## 0.5.38 (March 17, 2022)

- chore: fix blocklet error on no meta field

## 0.5.37 (March 16, 2022)

- chore: improve blocklet-connect process for no-developer-nft scenario

## 0.5.36 (March 15, 2022)

- chore: check purchased blocklet
- chore: blocklet index

## 0.5.35 (March 14, 2022)

- chore: improve private routes & login logic

## 0.5.34 (March 11, 2022)

- chore: fix two issues

## 0.5.33 (March 11, 2022)

- chore: compatible route

## 0.5.32 (March 10, 2022)

- chore: better moblie blocklet detail
- chore: add support subMenu
- chore: add price colum&&new tab open launch

## 0.5.31 (March 09, 2022)

- chore: resolve conflict
- chore: resolve code review
- Merge branch 'resolve-issues-part1' of github.com:blocklet/blocklet-store into resolve-issues-part1
- chore: add search-store

## 0.5.30 (March 08, 2022)

- chore: hiden permission column
- chore: merge blocklet-list
- fix #400

## 0.5.29 (March 07, 2022)

- chore: update the latest ocap package

## 0.5.28 (March 07, 2022)

- feat(connect-cli): add support for encrypted config data

## 0.5.27 (March 04, 2022)

- chore: merge launch-button an purchase-dialog
- chore: blocklet-detail purchase blocklet&&launch blocklet
- feat: purchase-dialog

## 0.5.26 (March 03, 2022)

- chore: fix typo

## 0.5.25 (March 02, 2022)

- fix: nft action url is broken

## 0.5.24 (March 02, 2022)

- fix: should open blocklet detail in new tab from console

## 0.5.23 (March 01, 2022)

- chore: deprecate CDN_URL config

## 0.5.22 (March 01, 2022)

- feat: support connect-cli workflow (#344)

## 0.5.21 (February 28, 2022)

- chore: tune i18n

## 0.5.20 (February 26, 2022)

- chore: bump deps to latest

## 0.5.19 (二月 25, 2022)

- chore: Compatible with blockletInfo

## 0.5.18 (二月 25, 2022)

- fix: make @blocklet/sdk, @blocklet/meta fixed at version 1.6.22

## 0.5.17 (二月 25, 2022)

- chore: add blocklet next tips
- chore(release): 0.5.16

## 0.5.16 (February 25, 2022)

- chore: bump chain deps to latest

## 0.5.15 (二月 24, 2022)

- chore: optimize blocklet deatil style
- fix: text break on mobile
- chore: add capabilities in blocklet detail

## 0.5.14 (二月 24, 2022)

- fix #402

## 0.5.13 (二月 23, 2022)

- feat: filter blocklet by price

## 0.5.12 (February 23, 2022)

- fix: disable scale on mobile to avoid styling issues

## 0.5.11 (二月 22, 2022)

- chore: add server-url launch blocklet

## 0.5.10 (二月 17, 2022)

- chore: complete pretty price on published
- chore: pretty price on upload
- chore: replace blocklet detail path

## 0.5.9 (二月 16, 2022)

- chore: fix purchase payment blocklet

## 0.5.8 (二月 13, 2022)

- chore: add migration0.5.8
- chore: add publishedAt sort
- chore: add permission field in blocklet
- chore: complete publish success tip

## 0.5.7 (February 14, 2022)

- chore: disable blocklet be composed by other blocklets

## 0.5.6 (二月 10, 2022)

- chore: update blocklet

## 0.5.5 (二月 09, 2022)

- chore: tune i18n
- chore: resolve review
- chore: optimization process on creat blocklet

## 0.5.4 (二月 08, 2022)

- chore: fix-blocklet

## 0.5.3 (二月 08, 2022)

- chore: update version

## 0.5.2 (二月 07, 2022)

- chore: update dependencies
- chore: modify the animation implementation

## 0.5.1 (February 07, 2022)

- chore: cleanup unused blocklet env variables

## 0.5.0 (January 31, 2022)

- chore: release v0.5.0

## 0.4.77 (一月 30, 2022)

- chore: replace-blocklet-logo

## 0.4.76 (一月 28, 2022)

- chore: fix DidAddress auto responsive
- chore: add did link
- chore: complete #355 part2

## 0.4.75 (一月 28, 2022)

- chore: fix code spell

## 0.4.74 (一月 28, 2022)

- chore: detail page launch-button
- chore: init

## 0.4.73 (一月 27, 2022)

- chore: add launch logo && store logo

## 0.4.72 (一月 26, 2022)

- fix: sort error

## 0.4.71 (一月 26, 2022)

- chore: modified url

## 0.4.70 (一月 25, 2022)

- chore: add error catch on upload&&publish

## 0.4.69 (一月 25, 2022)

- fix #336
- chore: complete filter by developer
- chore: add qurery-string
- chore: init

## 0.4.68 (一月 24, 2022)

- fix: blocklet serach by name||title

## 0.4.67 (一月 20, 2022)

- chore: verify NFT factory
- chore: remove fail code
- chore: onauth fix

## 0.4.66 (一月 20, 2022)

- fix: polish blocklet name check
- feat(ci): add lint step in ci

## 0.4.65 (January 20, 2022)

- fix: access-key remark length limit too small
- feat: prompt to set developerDid for blocklet cli

## 0.4.64 (一月 17, 2022)

- chore: update version

## 0.4.63 (一月 14, 2022)

- fix #330

## 0.4.62 (一月 14, 2022)

- fix: no category browser error

## 0.4.61 (一月 13, 2022)

- chore: update package

## 0.4.60 (一月 13, 2022)

- chore: resloves #322 && border color change

## 0.4.59 (一月 13, 2022)

- fix: update web wallet url

## 0.4.58 (一月 12, 2022)

- fix #297
- fix #276
- fix #317

## 0.4.57 (一月 12, 2022)

- fix(hot): error in table

## 0.4.56 (一月 11, 2022)

- fix: react hooks earky return statement
- fix #300
- fix #301
- fix #296
- chore: blocklet detail permissions
- fix #313

## 0.4.55 (一月 11, 2022)

- fix(ci): make `Blocklet workflow (Test)` excute first

## 0.4.54 (一月 11, 2022)

- chore: update package

## 0.4.53 (一月 10, 2022)

- fix: upload test-store use prod-store access-token

## 0.4.52 (一月 10, 2022)

- chore: ci upload to test-store
- fix(ci): use npm install @blocklet/cli

## 0.4.51 (一月 10, 2022)

- chore: resize icon
- chore: blocklet-list show category
- fix: #284
- chore: resloves #247, resloves #266, resloves #267

## 0.4.50 (一月 07, 2022)

- fix: migration 0.4.49 flow

## 0.4.49 (一月 06, 2022)

- chore: add public Note
- chore: fix #308 && revert some code
- chore: reset

## 0.4.48 (一月 05, 2022)

- chore: resloves #293, resloves #295, resloves #298, resloves #288
- chore: resloves #286, resloves #299

## 0.4.47 (一月 04, 2022)

- chore: remove api delete
- fix: router permission
- fix #283

## 0.4.46 (一月 04, 2022)

- fix: header tags should not be link

## 0.4.45 (一月 04, 2022)

- chore(doc): update blocklet.md

## 0.4.44 (十二月 31, 2021)

- chore: resolve code review
- chore: complete category!🎉
- chore: complete blocklet-list edit category
- chore: complete front-end debugging
- chore: complete category api
- Revert "chore: init"
- Revert "chore: remove name&title on upload"
- chore: init category
- chore: remove name&title on upload
- chore: init

## 0.4.43 (十二月 30, 2021)

- chore: remove blocklet-version somesome field
- chore: update
- chore: merge title&name,add uploadtime on blocklet-list

## 0.4.42 (十二月 27, 2021)

- feat: mobile index layout

## 0.4.41 (十二月 27, 2021)

- chore: resolves #248,fix table mobile layout

## 0.4.40 (十二月 25, 2021)

- chore: set table align text
- chore: fix #249
- chore: fix #215, fix #253
- chore: add storeTabs

## 0.4.39 (十二月 24, 2021)

- docs: update docs and screenshots

## 0.4.38 (十二月 24, 2021)

- fix: api/store.json name & description

## 0.4.37 (十二月 24, 2021)

- chore: remove react-use deps

## 0.4.36 (十二月 24, 2021)

- fix: index page crash

## 0.4.35 (十二月 24, 2021)

- chore: clean useless deps
- chore: use lodash-es replace lodash

## 0.4.34 (十二月 23, 2021)

- chore: fix #148
- chore: fix #228
- chore: fix #161

## 0.4.33 (十二月 23, 2021)

- feat(ci): add pr-title

## 0.4.32 (十二月 22, 2021)

- chore: change some
- chore: local
- chore: fixes #234, fixes #196

## 0.4.31 (December 22, 2021)

- chore(deps): bump to latest
- fix: blocklet upload failure for paid blocklets

## 0.4.30 (十二月 21, 2021)

- chore: responsive layout

## 0.4.29 (十二月 21, 2021)

- chore: remove custom pageSize
- chore: resolve review
- chore: fix #233
- chore: resolves #224, resolves #228, resolves #225
- chore:fixs #231, fixs #235, fixs #237
- fix #232
- chore: resolves #227
- chore: resolves #238
- chore: resolves #226

## 0.4.28 (十二月 20, 2021)

- chore: remove did-logo

## 0.4.27 (十二月 20, 2021)

- fix: jsdelivr cdn link -> local file link

## 0.4.26 (十二月 17, 2021)

- chore: disable category filter in mobile page
- chore: polish sidebar menu locale
- chore: polish setting page redirect
- chore: fix detail page share style
- chore: add category link in detail page

## 0.4.25 (十二月 17, 2021)

- chore: add cookie-consent

## 0.4.24 (十二月 17, 2021)

- chore: change markdown&blocklet info

## 0.4.23 (十二月 17, 2021)

- feat: home listpage support category

## 0.4.22 (十二月 17, 2021)

- fix: polish table columns custom

## 0.4.21 (十二月 17, 2021)

- feat: add github issue template; add functional structure diagram

## 0.4.20 (十二月 16, 2021)

- fix: feat: blocklet detail page add requirements field
- fix: remove blocklet-download versionID field
- chore: download api complete
- chore: change imageGallery
- chore: add screenshots
- chore: local
- chore: layout complete

## 0.4.19 (十二月 15, 2021)

- fix: blocklet list use its own updatedAt field

## 0.4.18 (十二月 14, 2021)

- chore: resolve review
- chore: remove 400
- feat: add table component error handling
- feat: table component support serverside pagination

## 0.4.17 (十二月 14, 2021)

- chore: resolve code review
- fix #175

## 0.4.16 (十二月 10, 2021)

- fix #204

## 0.4.15 (十二月 10, 2021)

- fix: mui-datatables style bugs

## 0.4.14 (十二月 09, 2021)

- chore: update deps

## 0.4.13 (十二月 08, 2021)

- update package

## 0.4.12 (十二月 08, 2021)

- fix #180

## 0.4.11 (十二月 07, 2021)

- fix: developer create

## 0.4.10 (十二月 07, 2021)

- fix: api developer info

## 0.4.9 (十二月 07, 2021)

- fix: border style

## 0.4.8 (十二月 06, 2021)

- fix: user.username -> user.name
- chore: seprate /api/admin/apply routes
- chore: resolve code review
- fix #183
- fix #174
- fix #181
- fix #178
- fix #162
- fix #179
- fix #176
- fix #173
- fix #172

## 0.4.7 (十二月 06, 2021)

- chore: upgrade blocklet/sdk

## 0.4.6 (十二月 06, 2021)

- chore: update arcblock-related deps
- chore: replace did-react with did-connect

## 0.4.5 (十二月 04, 2021)

- feat: meta.charging -> meta.payment

## 0.4.4 (十二月 01, 2021)

- feat #163
- feat #182
- fix #185
- chore: remove setupProxy

## 0.4.3 (十一月 30, 2021)

- fix #145

## 0.4.2 (十一月 30, 2021)

- fix #140
- fix #158
- fix #157

## 0.4.1 (November 30, 2021)

- blocklet can declare only one web interface
- blocklet can declare wellknown interface
- chore: bump deps to latest

## 0.4.0 (十一月 26, 2021)

- feat: REBRAND! Blocklet Registry -> Blocklet Store

## 0.3.76 (十一月 27, 2021)

- fix #147
- fix #130
- fix #136
- fix #128
- fix #132
- fix #133

## 0.3.75 (十一月 25, 2021)

- fix: review

## 0.3.74 (十一月 25, 2021)

- fix #137
- fix #143
- fix #138
- fix #139
- fix #146

## 0.3.73 (November 23, 2021)

- upgrade arcblock dependencies

## 0.3.72 (十一月 23, 2021)

- fix #129
- fix #135
- fix #141

## 0.3.71 (十一月 23, 2021)

- fix #128

## 0.3.70 (十一月 19, 2021)

- fix: blocklet purchase list use remote paging
- feat: polish responsive layout
- feat: move admin blocklet detail page to public blocklet detail page
- chore: change admin page sidebar menu sort
- chore: fix common.blocklet locales
- fix #44
- chore: check detail page should show purchase history
- fix #120
- fix #123
- fix #67
- fix #118

## 0.3.69 (十一月 19, 2021)

- feat: use abtnode blocklet migration flow

## 0.3.68 (十一月 15, 2021)

- fix #106
- fixed #49
- fix #98
- fix #115
- chore: update hosted-git-info-fixed
- chore: use @blocklet/sdk/database
- feat: use craco
- feat: use mui-datatables replace material-table
- chore: polish analyze scripts
- chore: optimize webpack bundle
- fix #111
- fix #112

## 0.3.67 (November 09, 2021)

- remove purchase blocklet dialog

## 0.3.66 (November 08, 2021)

- chore: update deps to latest

## 0.3.65 (十一月 01, 2021)

- fix: 0.3.60 migration error

## 0.3.64 (十月 29, 2021)

- fix: nft-store config-api list

## 0.3.63 (十月 28, 2021)

- fix: nft-store config-api

## 0.3.62 (十月 28, 2021)

- chore: update deps

## 0.3.61 (十月 28, 2021)

- fix: publish blocklet

## 0.3.60 (十月 26, 2021)

- feat: check if is first install
- fix: code review
- feat: migration flow
- fix: route path
- fix: paginate middleware
- chore: fix typo
- chore: use blocklet/sdk WalletHandler
- chore
- feat: support claim.digest
- feat: redirect to "Install on AbtNode" when click "Launch" (#94)
- fix #87
- fix #90
- chore: make list api return stable sort data
- fix: db promise
- feat: use standard restful style api route
- chore: fix review comments
- fix: private route
- fix: common.uploadedAt locale
- fix: use db promise
- feat: enhanced db promise
- fix: code review
- Merge branch 'master' of github.com:blocklet/blocklet-registry into fix-bugbash
- fix: show register as developer button
- fix: refresh developer info after login
- chore: ci for staging
- fix: publish blocklet back to use did-connect
- feat: create/publish blocklet without did-connect
- chore: fix last
- fix #73
- fix #79
- chore: fix locale
- fix #82
- fix #69
- fix #80
- fix #72
- fix #71
- fix #83 fix #75
- chore: fix locale
- fix #74
- chore: format datetime
- fix #76
- fix: locale
- fix #54
- fix #70
- v0.3.59
- v0.3.57
- chore: remove useless code
- fix #58
- fix #63
- chore: remove accessKey revoke/unrevoke
- chore: imporve admin auth
- v0.3.56
- feat: protect blocklet list actions
- fix #52
- feat: support create blocklet in cli
- fix: user accessKey check
- fix: home page error 500
- v0.3.55
- feat: new workflow (#50)

## 0.3.59 (October 05, 2021)

- ask the user if they have purchased a blocklet before redirecting to "install on abtnode"
- feat: redirect to "Install on Abtnode" when click "Install"

## 0.3.58 (September 18, 2021)

- fix: version
- fix: do not block start when can not connect to chain
- fix: always return original meta on prettyPrice
- fix: wrap prettyPrice inside try-catch to make api more robust

## 0.3.57 (九月 18, 2021)

- chore: remove useless code
- fix #58
- fix #63
- chore: remove accessKey revoke/unrevoke
- chore: imporve admin auth

## 0.3.56 (九月 17, 2021)

- feat: protect blocklet list actions
- fix #52
- feat: support create blocklet in cli
- fix: user accessKey check
- fix: home page error 500

## 0.3.55 (九月 16, 2021)

- fix: pre-start hooks

## 0.3.54 (九月 16, 2021)

- chore: ci for test branch
- chore: remove form default value
- chore: fix
- feat: support revoke developer
- feat: rekove accessKey
- feat: support blocklet edit
- feat: support blocklet blocked
- feat: upload permission check
- feat: create-blocklet use did-auth
- fix: publish signature
- add test route
- feat: new publish workflow

## 0.3.53 (September 10, 2021)

- feat: install blocklet by ABT Node launcher

## 0.3.52 (September 09, 2021)

- add did document relates configurations

## 0.3.51 (八月 18, 2021)

- chore: upgrade dependencies

## 0.3.50 (七月 26, 2021)

- chore: use @arcblock/eslint-config

## 0.3.49 (July 22, 2021)

- chore: udpate ref to nft-store blocklet

## 0.3.48 (July 19, 2021)

- fix the bug of join url
- fix bocklet price

## 0.3.47 (July 05, 2021)

- disable deploy to production and deveopment registry

## 0.3.46 (July 03, 2021)

## 0.3.45 (July 03, 2021)

## 0.3.44 (July 03, 2021)

## 0.3.43 (July 03, 2021)

## 0.3.42 (五月 23, 2021)

- feat: provide a api for nft-store

## 0.3.41 (五月 13, 2021)

- fix: blocklet card's cover fallback

## 0.3.40 (五月 13, 2021)

- fix: update ux library

## 0.3.39 (五月 08, 2021)

- feat: use blocklet card component
- fix: update dependencies

## 0.3.38 (May 06, 2021)

- fix: update default chain endpoint

## 0.3.37 (April 27, 2021)

- chore: return token symbols in blocklet meta
- chore: bump ocap dependency version

## 0.3.36 (四月 22, 2021)

- fix: add common.documentation translation

## 0.3.35 (April 16, 2021)

- fix: detail page error

## 0.3.34 (April 16, 2021)

- fix: detail page error

## 0.3.33 (April 16, 2021)

- rename title to "Blocklet Registry" and publish to production marketplace

## 0.3.32 (April 16, 2021)

- feat: set proper cache headers for nft-display api

## 0.3.31 (April 14, 2021)

- chore: bump dependency version

## 0.3.30 (April 13, 2021)

- fix: nft status endpoint

## 0.3.29 (April 12, 2021)

- chore: trigger a new deploy

## 0.3.28 (四月 12, 2021)

- fix: blocklet relative time

## 0.3.27 (April 12, 2021)

- chore: trigger a new deploy

## 0.3.26 (四月 12, 2021)

- feat: add blockelt lastPublishedAt display

## 0.3.25 (April 12, 2021)

- feat: add cdnUrl in config and registry meta api

## 0.3.24 (April 12, 2021)

- fix: add empty display for list page (#22)
- fix: default chain host should point to staging

## 0.3.23 (April 12, 2021)

- chore: trigger a new deploy

## 0.3.22 (April 12, 2021)

- chore: trigger a new deploy

## 0.3.11 (April 11, 2021)

- chore: trigger a new deploy

## 0.3.10 (April 10, 2021)

- feat: support nft action endpoints

## 0.3.9 (April 09, 2021)

- fix: dev environment proxy server api error

## 0.3.8 (April 09, 2021)

- chore: trigger a new deploy

## 0.3.7 (April 08, 2021)

- fix: blocklet publish error

## 0.3.6 (April 08, 2021)

- fix: better request source identifier for meta api

## 0.3.5 (April 08, 2021)

- chore: restructure webapp pages
- fix: make token symbol attach optional
- fix: typo

## 0.3.4 (四月 07, 2021)

- add price in detail page

## 0.3.3 (April 02, 2021)

- add install and purchase button
- add blocklet detail page
- add blocklets list page

## 0.3.2 (April 02, 2021)

- Merge branch 'master' of github.com:blocklet/blocklet-registry into master
- fix: registry meta should return chainHost for blocklet publish

## 0.3.1 (March 31, 2021)

## 0.3.0 (March 30, 2021)

- feat: add nft-store

## 0.2.5 (March 30, 2021)

- feat: support nft display api

## 0.2.4 (March 28, 2021)

- feat: support verify non-free blocklets

## 0.2.3 (March 26, 2021)

- feat: append registry id/pk/sig in meta api
- chore: change dependency scope to ocap

## 0.2.2 (March 09, 2021)

- fix update blocklet bug

## 0.2.1 (March 09, 2021)

- fix update blocklet bug

## 0.2.0 (March 08, 2021)

- fix bump version
- change sig encoding to base58
- change pk encoding to base58
- polish sign
- fix multi sig
- fix
- add exclude and extra fields when publish blocklet
- feat: modify blocklet verification and add registry signature to blocklet meta

## 0.1.4 (February 24, 2021)

- add registry meta api

## 0.1.3 (January 22, 2021)

- remove compatibility code

## 0.1.2 (January 21, 2021)

- bump version

## 0.1.1 (January 21, 2021)

- fix bump relates scripts
- remove release to github
- bunch of fixes (#6)
- polish get blocklet details
- add favicon
- add no-cache related headers to .json api (#5)
- polish blocklet routes
- add logoURL to metadata (#4)
- fix logo assets (#3)
- fix download tarball bug
- fix download tarball bug
- fix upload bug
- fix blocklet.json dist error
- [skip ci] Update README.md
