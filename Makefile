TOP_DIR=.
README=$(TOP_DIR)/README.md

VERSION=$(strip $(shell cat version))

build:
	@echo "Building the software..."

init: install dep
	@echo "Initializing the repo..."
	@npm i -g --allow-build=sqlite3 @blocklet/cli@beta dotenv-flow-cli

github-init: install dep
	@echo "Initialize software required for (normally ubuntu software)"
	@pnpm i -g --allow-build=sqlite3 @blocklet/cli@beta dotenv-flow-cli

github-nginx:
	@bash ./blocklets/blocklet-store/scripts/nginx.sh

install:
	@echo "Install software required for this repo..."

dep:
	@echo "Install dependencies required for this repo..."
	@pnpm install
	@cd packages/list && npm run build
	@cd packages/util && npm run build

pre-build: install dep
	@echo "Running scripts before the build..."

post-build:
	@echo "Running scripts after the build is done..."

all: pre-build build post-build

test:
	@echo "Running test suites..."

lint:
	@echo "Linting the software..."
	@npm run lint

doc:
	@echo "Building the documenation..."

precommit: dep lint doc build test

clean:
	@echo "Cleaning the build..."

watch:
	@make build
	@echo "Watching templates and slides changes..."
	@fswatch -o src/ | xargs -n1 -I{} make build

run:
	@echo "Running the software..."

include .makefiles/*.mk

.PHONY: build init install dep pre-build post-build all test doc precommit clean watch run bump-version create-pr
