
 import {Scene} from './scene.js';

 window.addEventListener('load', () => {
   const config = {
     type: Phaser.AUTO,
     scale: {
       mode: Phaser.Scale.FIT,
       autoCenter: Phaser.Scale.CENTER_HORIZONTALLY,
       width: window.innerWidth * window.devicePixelRatio,
       height: window.innerHeight * window.devicePixelRatio,
     },
     parent: 'phaser-example',
     scene: [Scene],
     backgroundColor: 0xffffff,
     audio: {
       disableWebAudio: false,
     },
     physics: {
       default: 'arcade',
       arcade: {
           debug: false
       }
     },
   };
   const game = new Phaser.Game(config);
   window.focus();
 });
 