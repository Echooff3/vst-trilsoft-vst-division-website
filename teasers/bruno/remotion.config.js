import { Config } from '@remotion/cli/config';

// Same render path as the Conceal-N-Strike teasers (Remotion 4, then a
// 6-frame GOP so the homepage can scrub currentTime cheaply; see
// encode.sh). REMOTION_CHROME overrides the browser.
Config.setBrowserExecutable(
  process.env.REMOTION_CHROME || (process.platform === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/google-chrome')
);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
if (process.platform !== 'darwin') Config.setChromiumOpenGlRenderer('swiftshader');
