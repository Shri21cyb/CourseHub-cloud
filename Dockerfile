# Copyright 2019,2020 IBM
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

FROM node:alpine
LABEL maintainer="your-team@iiit.ac.in"

RUN apk update && apk upgrade

COPY package.json /app/package.json
COPY . /app/
WORKDIR /app
RUN npm install

RUN chmod -R u+x /app && \
    chgrp -R 0 /app && \
    chmod -R g=u /app /etc/passwd

ENV PORT 8080
EXPOSE 8080

CMD ["node", "src/app.js"]