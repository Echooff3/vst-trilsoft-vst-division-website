import { Config } from '@remotion/cli/config';

// Same render path as the Conceal-N-Strike teasers (Remotion 4, then a
// 6-frame GOP so the homepage can scrub currentTime cheaply).
Config.setBrowserExecutable('/usr/bin/google-chrome');
Config.setVideoImageFormat('jpeg');
Config.setOverwriteOutput(true);
Config.setChromiumOpenGlRenderer('swiftshader');
