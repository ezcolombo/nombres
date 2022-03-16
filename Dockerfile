# syntax=docker/dockerfile:1

FROM node:current-slim
ENV NODE_ENV=production
ENV PORT=8080

WORKDIR nombres
COPY ["package.json", "package-lock.json", "./"]
RUN npm install --only=production

COPY app.js .
COPY index.html .
COPY assets/ assets/
COPY data/ data/

EXPOSE ${PORT}
CMD [ "node", "app.js" ]