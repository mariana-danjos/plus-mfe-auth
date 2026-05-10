FROM node:20-alpine
WORKDIR /app
RUN npm install -g vite
# Esperamos que o build seja feito localmente (npm run build)
# e o dist/ seja copiado para o container
COPY dist ./dist
EXPOSE 4001
CMD ["vite", "preview", "--port", "4001", "--host"]
