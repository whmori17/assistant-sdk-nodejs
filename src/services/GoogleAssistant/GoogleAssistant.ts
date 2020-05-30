/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { relative } from 'path';
import { loadSync } from '@grpc/proto-loader';
import { credentials, loadPackageDefinition } from 'grpc';
import { GoogleAssistantCredentials } from '../../models/GoogleAssistantCredentials';
import { GoogleAssistantResponse } from '../../models/GoogleAssistantResponse';

require('dotenv').config();
const protoFiles = require('google-proto-files');
const GoogleAuth = require('google-auth-library');

const PROTO_ROOT_DIR = protoFiles('..');
const protoFileName = relative(PROTO_ROOT_DIR, protoFiles.embeddedAssistant.v1alpha2);
const packageDefinition = loadSync(protoFileName);
const embedded_assistant_pb = loadPackageDefinition(packageDefinition);

export class GoogleAssistant {
  client: any;
  locale: string;
  deviceModelId: string;
  deviceInstanceId: string;
  endpoint_: string;

  constructor(credentials: GoogleAssistantCredentials) {
    GoogleAssistant.prototype.endpoint_ = 'embeddedassistant.googleapis.com';
    this.client = this.createClient_(credentials);
    this.locale = process.env.ASSISTANT_LANG;
    this.deviceModelId = 'default';
    this.deviceInstanceId = 'default';
  }

  createClient_(gCredentials: GoogleAssistantCredentials) {
    const sslCreds = credentials.createSsl();
    // https://github.com/google/google-auth-library-nodejs/blob/master/ts/lib/auth/refreshclient.ts
    const auth = new GoogleAuth();
    const refresh = new auth.UserRefreshClient();
    refresh.fromJSON(gCredentials, function (_res) {});
    const callCreds = credentials.createFromGoogleCredential(refresh);
    const combinedCreds = credentials.combineChannelCredentials(sslCreds, callCreds);
    const client = new embedded_assistant_pb.EmbeddedAssistant(this.endpoint_, combinedCreds);
    return client;
  }

  assist(input: string): Promise<any> {
    const config = new embedded_assistant_pb.AssistConfig();
    config.setTextQuery(input);
    config.setAudioOutConfig(new embedded_assistant_pb.AudioOutConfig());
    config.getAudioOutConfig().setEncoding(1);
    config.getAudioOutConfig().setSampleRateHertz(16000);
    config.getAudioOutConfig().setVolumePercentage(100);
    config.setDialogStateIn(new embedded_assistant_pb.DialogStateIn());
    config.setDeviceConfig(new embedded_assistant_pb.DeviceConfig());
    config.getDialogStateIn().setLanguageCode(this.locale);
    config.getDeviceConfig().setDeviceId(this.deviceInstanceId);
    config.getDeviceConfig().setDeviceModelId(this.deviceModelId);
    const request = new embedded_assistant_pb.AssistRequest();
    request.setConfig(config);

    delete request.audio_in;
    const conversation = this.client.assist();
    return new Promise((resolve, reject) => {
      const assistantResponse: GoogleAssistantResponse = {};
      conversation.on('data', (data) => {
        if (data.device_action) {
          assistantResponse.deviceAction = JSON.parse(data.device_action.device_request_json);
        } else if (data.dialog_state_out !== null && data.dialog_state_out.supplemental_display_text) {
          assistantResponse.text = data.dialog_state_out.supplemental_display_text;
        }
      });
      conversation.on('end', (_error) => {
        // Response ended, resolve with the whole response.
        resolve(assistantResponse);
      });
      conversation.on('error', (error) => {
        reject(error);
      });
      conversation.write(request);
      conversation.end();
    });
  }
}
