# Shared Canvas

Very simple canvas application that can be shared between multiple users thanks to CRDTs. 

Check it out here: https://shared-canvas.vercel.app/ 

Here's how it works for two users in different browsers:

<img src="./assets/screen_record.gif" width="700"></img>

## Notes

Currently, the initial connection to the signalling server takes quite a bit of time. The app is still responsive during that time, but not collaborative.

## Local development

The project barely has any dependencies other than the YJS related ones. It does not use any framework like React, Svelte or something else. It's pure Javascript.

Install all the dependencies

```shell
npm install
```

To start the dev server

```shell
npm run dev
```

Then head over to `http://localhost:5173/` on any browser.

