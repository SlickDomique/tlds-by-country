
## Scrapper setup

```
docker build -t domain_name_scrapper .
```

Run the container executing the scripts
```
docker run --user "$(id -u):$(id -g)" --mount type=bind,src=./public,dst=/code/public --mount type=volume,dst=/code/node_modules domain_name_scrapper
```

Run the container and get a shell for development
```
docker run -it --entrypoint sh --user "$(id -u):$(id -g)" --mount type=bind,src=.,dst=/code --mount type=volume,dst=/code/node_modules domain_name_scrapper
```

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
