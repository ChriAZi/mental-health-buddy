/**
 * Copyright 2020 Google LLC
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
import { Action } from './action.js';


/**
 * Represent Mental Buddy scene.
 */
export class Scene extends Phaser.Scene {
  /**
   * Constructor to initialize game including the Interactive Canvas object.
   * Assistant Canvas Action object registers all callbacks triggered by voice.
   *
   * "PlayGame" scene.
   */
  constructor() {
    super('Scene');
  }

  /**
   * Preload assets (sprites, sounds, or text) to be used by the game.
   */
  preload() {
    // Images
    this.load.bitmapFont('roboto',
      '/assets/fonts/bitmap/roboto-font.png',
      '/assets/fonts/bitmap/roboto-font.xml');
    this.load.image('background', '/assets/backgroundMentalBuddy.png');
    this.load.path = '/assets/';
    this.load.multiatlas('snow-pal', ['./snow-pal.json']);
    this.load.multiatlas('win_lose', ['./win-lose.json']);

    // Sounds
    this.wrongSound = new Howl({
      src: ['https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg'],
      autoplay: false,
      loop: false,
      volume: 1,
    });
    this.correctSound = new Howl({
      src: ['https://actions.google.com/sounds/v1/cartoon/siren_whistle.ogg'],
      autoplay: false,
      loop: false,
      volume: 1,
      sprite: {
        up: [0, 3300],
      }
    });
    this.winSound = new Howl({
      src: ['https://actions.google.com/sounds/v1/cartoon/crazy_dinner_bell.ogg'],
      autoplay: false,
      loop: false,
      volume: 1,
    });
    this.loseSound = new Howl({
      src: ['https://actions.google.com/sounds/v1/cartoon/concussive_hit_guitar_boing.ogg'],
      autoplay: false,
      loop: false,
      volume: 1,
    });
  }

  /**
   * Called once to create the game along with other objects required
   * to produce the initial state of the game.
   */
  create() {
    this.questions = ['How often have you been bothered by little interest or pleasure in doing things over the past 2 weeks?',
      'Over the last 2 weeks how often have you been feeling down, depressed, or hopeless?',
      'How often have you had trouble falling or staying asleep, or sleeping too much?',
      'How often have you been feeling tired or having little energy over the last two weeks?',
      'How often have you had poor appetite or overeating?',
      'How often have you been feeling bad about yourself — or that you are a failure or have let yourself or your family down?',
      'Over the last two weeks how often did you have trouble concentrating on things, such as reading the newspaper or watching television?',
      'How often have you been bothered by moving or speaking so slowly that other people could have noticed? Or so fidgety or restless that you have been moving a lot more than usual?',
      'How often have you had thoughts that you would be better off dead, or thoughts of hurting yourself in some way?'];

    this.visibleObjects = [];

    // Background
    this.background = this.add.image(0, 0, 'background')
      .setOrigin(0, 0)
      .setDisplaySize(this.scale.width, this.scale.height);
    window.interactiveCanvas.getHeaderHeightPx()
      .then((headerHeight) => {
        this.background
          .setY(headerHeight)
          .setDisplaySize(this.scale.width, this.scale.height - headerHeight);
      });

    // Start MentalBuddy Button
    this.startMentalBuddyButton = new Phaser.GameObjects.Text(this, 0,
      this.scale.height / 2, 'Start MentalBuddy', { fontSize: 75, fill: '#000' });
    this.startMentalBuddyButton.x = (this.scale.width / 2) - (this.startMentalBuddyButton.width / 2);
    this.startMentalBuddyButton
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.startMentalBuddyButton.setStyle({ fill: '#ff0' }))
      .on('pointerout', () => this.startMentalBuddyButton.setStyle({ fill: '#000' }))
      .on('pointerdown', () => this.startMentalBuddyButton.setStyle({ fill: '#0ff' }))
      .on('pointerup', () => {
        this.startMentalBuddyButton.setStyle({ fill: '#ff0' });
        window.interactiveCanvas.sendTextQuery('Start MentalBuddy');
      });


    // Start Questionnaire Button
    this.startQuestionnaireButton = new Phaser.GameObjects.Text(this, 0,
      this.scale.height / 2, 'Start Questionnaire', { fontSize: 75, fill: '#000' });
    this.startQuestionnaireButton.x = (this.scale.width / 2) - (this.startQuestionnaireButton.width / 2);
    this.startQuestionnaireButton
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.startQuestionnaireButton.setStyle({ fill: '#ff0' }))
      .on('pointerout', () => this.startQuestionnaireButton.setStyle({ fill: '#000' }))
      .on('pointerdown', () => this.startQuestionnaireButton.setStyle({ fill: '#0ff' }))
      .on('pointerup', () => {
        this.startQuestionnaireButton.setStyle({ fill: '#ff0' });
        window.interactiveCanvas.sendTextQuery('Start questionnaire');
      });


    // Question Text
    this.questionText = new Phaser.GameObjects.Text(this, 0,
      0, 'Question Text', { fontSize: 40, fill: '#000' });
    this.questionText.x = (this.scale.width / 2) - (this.questionText.width / 2);
    this.questionText.y = (this.scale.height / 3);
    this.questionText.text = this.questions[0];
    this.questionText.setVisible(false);

    
    // Result Text
    this.resultText = new Phaser.GameObjects.Text(this, 0,
      0, 'Result', { fontSize: 40, fill: '#000' });
    this.resultText.x = (this.scale.width / 2) - (this.resultText.width / 2);
    this.resultText.y = (this.scale.height / 3);
    this.resultText.setVisible(false);


    // Answer Option 1 Button
    this.answer1Button = new Phaser.GameObjects.Text(this, 0,
      this.scale.height / 2, 'Not at all', { fontSize: 30, fill: '#000' });
    this.answer1Button.x = (this.scale.width / 8) - (this.answer1Button.width / 2);
    this.answer1Button.y = (this.scale.height / 3) * 2;
    this.answer1Button
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.answer1Button.setStyle({ fill: '#ff0' }))
      .on('pointerout', () => this.answer1Button.setStyle({ fill: '#000' }))
      .on('pointerdown', () => this.answer1Button.setStyle({ fill: '#0ff' }))
      .on('pointerup', () => {
        this.answer1Button.setStyle({ fill: '#ff0' });
        window.interactiveCanvas.sendTextQuery('Not at all');
      });

    // Answer Option 2 Button
    this.answer2Button = new Phaser.GameObjects.Text(this, 0,
      this.scale.height / 2, 'Several days', { fontSize: 30, fill: '#000' });
    this.answer2Button.x = ((this.scale.width / 8) * 3) - (this.answer2Button.width / 2);
    this.answer2Button.y = (this.scale.height / 3) * 2;
    this.answer2Button
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.answer2Button.setStyle({ fill: '#ff0' }))
      .on('pointerout', () => this.answer2Button.setStyle({ fill: '#000' }))
      .on('pointerdown', () => this.answer2Button.setStyle({ fill: '#0ff' }))
      .on('pointerup', () => {
        this.answer2Button.setStyle({ fill: '#ff0' });
        window.interactiveCanvas.sendTextQuery('Several days');
      });
    // Answer Option 3 Button
    this.answer3Button = new Phaser.GameObjects.Text(this, 0,
      this.scale.height / 2, 'More than half the days', { fontSize: 30, fill: '#000' });
    this.answer3Button.x = ((this.scale.width / 8) * 5) - (this.answer3Button.width / 2);
    this.answer3Button.y = (this.scale.height / 3) * 2;
    this.answer3Button
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.answer3Button.setStyle({ fill: '#ff0' }))
      .on('pointerout', () => this.answer3Button.setStyle({ fill: '#000' }))
      .on('pointerdown', () => this.answer3Button.setStyle({ fill: '#0ff' }))
      .on('pointerup', () => {
        this.answer3Button.setStyle({ fill: '#ff0' });
        window.interactiveCanvas.sendTextQuery('More than half the days');
      });
    // Answer Option 4 Button
    this.answer4Button = new Phaser.GameObjects.Text(this, 0,
      this.scale.height / 2, 'Almost every day', { fontSize: 30, fill: '#000' });
    this.answer4Button.x = ((this.scale.width / 8) * 7) - (this.answer4Button.width / 2);
    this.answer4Button.y = (this.scale.height / 3) * 2;
    this.answer4Button
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.answer4Button.setStyle({ fill: '#ff0' }))
      .on('pointerout', () => this.answer4Button.setStyle({ fill: '#000' }))
      .on('pointerdown', () => this.answer4Button.setStyle({ fill: '#0ff' }))
      .on('pointerup', () => {
        this.answer4Button.setStyle({ fill: '#ff0' });
        window.interactiveCanvas.sendTextQuery('Almost every day');
      });

        // Progress Questions
        this.progressText = new Phaser.GameObjects.Text(this, 0,
          0, 'Progress Text', { fontSize: 40, fill: '#000' });
        this.progressText.text =  '1/9';
        this.progressText.x = (this.scale.width / 2) - (this.progressText.width / 2);
        this.progressText.y = (this.scale.height / 3) * 2.5;
        this.progressText.setVisible(false);
    

    this.visibleObjects.push(this.background);
    this.add.existing(this.startMentalBuddyButton);

    this.add.existing(this.startQuestionnaireButton);

    this.add.existing(this.questionText);
    this.add.existing(this.resultText);
    this.add.existing(this.answer1Button);
    this.add.existing(this.answer2Button);
    this.add.existing(this.answer3Button);
    this.add.existing(this.answer4Button);
    this.add.existing(this.progressText);


    // Set assistant at game level.
    this.assistant = new Action(this);
    // Call setCallbacks to register assistant action callbacks.
    this.assistant.setCallbacks();
  }

  /**
   * Call to start Snow Pal and reset images from initial state.
   */
  startMentalBuddy() {
    this.setVisible(true);
    this.startMentalBuddyButton.setVisible(false);
    this.startQuestionnaireButton.setVisible(true);
    this.questionText.setVisible(false);
    this.resultText.setVisible(false);
    this.answer1Button.setVisible(false);
    this.answer2Button.setVisible(false);
    this.answer3Button.setVisible(false);
    this.answer4Button.setVisible(false);
    this.progressText.setVisible(false);
    this.updateCanvasState();
  }

  startQuestionnaire() {
    this.setVisible(true);
    this.startMentalBuddyButton.setVisible(false);
    this.startQuestionnaireButton.setVisible(false);
    this.questionText.setVisible(true);
    this.resultText.setVisible(false);
    this.answer1Button.setVisible(true);
    this.answer2Button.setVisible(true);
    this.answer3Button.setVisible(true);
    this.answer4Button.setVisible(true);
    this.progressText.setVisible(true);
    this.updateCanvasState();
  }

  showNextQuestion(nextQuestion) {
    //this.correctSound.play('up');
    this.questionText.text = this.questions[nextQuestion - 1];
    this.progressText.text = nextQuestion + '/9';

    this.updateCanvasState();
  }

  showResult(resultString) {
    this.setVisible(true);
    this.startMentalBuddyButton.setVisible(false);
    this.startQuestionnaireButton.setVisible(false);
    this.questionText.setVisible(false);
    this.resultText.setVisible(true);
    this.answer1Button.setVisible(false);
    this.answer2Button.setVisible(false);
    this.answer3Button.setVisible(false);
    this.answer4Button.setVisible(false);
    this.progressText.setVisible(false);

    this.resultText.text = resultString;

    this.updateCanvasState();
  }

  updateCanvasState() {
    window.interactiveCanvas.setCanvasState({
    });
  }

  updateQuestionText() {

  }

  /**
   * Finish game by setting invisible main stage and displaying images of win or lose.
   * @param  {boolean} userWins true to display win image or false to display
   * false one.
   */
  displayGameOverScreen(userWins) {
    // fade duration and RGB to fade out and fade in main camera
    this.cameras.main.fade(3000, 255, 255, 255, true, (cam, complete) => {
      if (complete === 1) {
        this.setVisible(0);
        this.cameras.main.fadeIn(3000, 255, 255, 255);
      }
    });
  }

  /**
   * Set visibility to images. Since images use Alpha, then 0 is false and
   * 1 is true.
   * @param  {boolean} visible to set visibility to true or false on a object.
   */
  setVisible(visible) {
    this.visibleObjects.forEach((vo) => vo.setAlpha(visible ? 1 : 0));
  }
}

