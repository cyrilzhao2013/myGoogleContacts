// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC =
  "https://www.googleapis.com/discovery/v1/apis/people/v1/rest";

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
const SCOPES =
  "https://www.googleapis.com/auth/contacts https://www.googleapis.com/auth/directory.readonly";
const CLIENT_ID =
  "773422534968-negk04dbvd5907prmcmop2hj7q2rcse1.apps.googleusercontent.com";
const API_KEY = "AIzaSyA6Ctq-2pXOVN6dahzS0TXEb8xRqhEvyZc";

class GoogleAPI {
  private tokenClient: any;
  private gapi: any;

  constructor() {}

  getGapi() {
    return this.gapi;
  }

  async auth() {
    return new Promise<void>((resolve) => {
      this.tokenClient.callback = async (resp: any) => {
        if (resp.error !== undefined) {
          throw resp;
        }
        // const $signoutButton = document.getElementById("signout_button");
        // const $authorizeButton = document.getElementById("authorize_button");

        // if ($signoutButton) {
        //   $signoutButton.style.visibility = "visible";
        // }
        // if ($authorizeButton) {
        //   $authorizeButton.innerText = "Refresh";
        // }
        // await listConnectionNames();
        resolve();
      };

      if ((window as any).gapi.client.getToken() === null) {
        // Prompt the user to select a Google Account and ask for consent to share their data
        // when establishing a new session.
        this.tokenClient.requestAccessToken({ prompt: "consent" });
      } else {
        // Skip display of account chooser and consent dialog for an existing session.
        this.tokenClient.requestAccessToken({ prompt: "" });
      }
    });
  }

  async init() {
    return new Promise<void>((resolve) => {
      let gapiInited = false;
      let gisInited = false;

      const gapiScript = document.createElement("script");
      gapiScript.src = "https://apis.google.com/js/api.js";
      gapiScript.onload = () => {
        (window as any).gapi.load("client", async () => {
          await (window as any).gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: [DISCOVERY_DOC],
          });
          gapiInited = true;

          if (gapiInited && gisInited) {
            resolve();
          }
        });
      };

      const gsiScript = document.createElement("script");
      gsiScript.src = "https://accounts.google.com/gsi/client";
      gsiScript.onload = () => {
        this.tokenClient = (
          window as any
        ).google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: "", // defined later
        });

        gisInited = true;

        if (gapiInited && gisInited) {
          resolve();
        }
      };

      document.head.appendChild(gapiScript);
      document.head.appendChild(gsiScript);
    });
  }
}

export const googleApi = new GoogleAPI();
