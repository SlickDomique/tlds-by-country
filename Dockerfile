FROM mcr.microsoft.com/playwright:v1.50.1-noble

RUN mkdir /code
WORKDIR /code
COPY . /code
RUN npm install
RUN npx playwright install
CMD [ "npm", "run", "scrap" ]
EXPOSE 8000
