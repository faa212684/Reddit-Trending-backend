FROM python:3.8-slim-buster 
WORKDIR /app
RUN apt-get update && \
  apt-get upgrade -yqq && \
  apt-get install -yqq nodejs npm
RUN npm install -g nodemon pm2
COPY requirements.txt /app/
RUN pip install -r requirements.txt
#RUN python -m nltk.downloader popular
RUN python -m nltk.downloader -d /usr/local/share/nltk_data popular
COPY . /app/