export ENDPOINT_CONSECUTIVE_TIME=2

blocklet server stop -f
rm -rf .blocklet-server
blocklet server init -f --sk "$TEST_SERVER_SK"
blocklet server start
blocklet dev install
blocklet dev start --e2e
