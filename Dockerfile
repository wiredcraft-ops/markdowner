FROM buildkite/puppeteer:latest
RUN apt update && apt install -y git
RUN npm install wcl-markdowner
ENV PATH="${PATH}:/node_modules/.bin"
