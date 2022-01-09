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

    // Sounds
    this.confirmationSound = new Howl({
      src: ['/assets/confirmation.wav'],
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
  }

  /**
   * Called once to create the game along with other objects required
   * to produce the initial state of the game.
   */
  create() {
    this.questions = ['How often have you been bothered by little \n interest or pleasure in doing things over \n the past 2 weeks?',
      'Over the last 2 weeks how often have you been \n  feeling down, depressed, or hopeless?',
      'How often have you had trouble falling or \n staying asleep, or sleeping too much?',
      'How often have you been feeling tired or \n having little energy over the last two weeks?',
      'How often have you had poor appetite or \n overeating?',
      'How often have you been feeling bad about yourself \n — or that you are a failure or have let \n yourself or your family down?',
      'Over the last two weeks how often did you have \n trouble concentrating on things, such as reading \n the newspaper or watching television?',
      'How often have you been bothered by moving or \n speaking so slowly that other people could have noticed? Or so fidgety or \n restless that you have been moving a lot more than usual?',
      'How often have you had thoughts that you would be \n better off dead, or thoughts of hurting yourself in some way?'];

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
      this.scale.height / 2, 'Start MentalBuddy', { fontSize: 75, fill: '#51716D' });
    this.startMentalBuddyButton.x = (this.scale.width / 2) - (this.startMentalBuddyButton.width / 2);
    this.startMentalBuddyButton
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.startMentalBuddyButton.setStyle({ fill: '#a3e4db' }))
      .on('pointerout', () => this.startMentalBuddyButton.setStyle({ fill: '#51716D' }))
      .on('pointerdown', () => this.startMentalBuddyButton.setStyle({ fill: '#a3e4db' }))
      .on('pointerup', () => {
        this.startMentalBuddyButton.setStyle({ fill: '#ff0' });
        window.interactiveCanvas.sendTextQuery('Start MentalBuddy');
      });


    // Start Questionnaire Button
    this.startQuestionnaireButton = new Phaser.GameObjects.Text(this, 0,
      this.scale.height / 2, 'Start Questionnaire', { fontSize: 75, fill: '#51716D' });
    this.startQuestionnaireButton.x = (this.scale.width / 2) - (this.startQuestionnaireButton.width / 2);
    this.startQuestionnaireButton
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.startQuestionnaireButton.setStyle({ fill: '#a3e4db' }))
      .on('pointerout', () => this.startQuestionnaireButton.setStyle({ fill: '#51716D' }))
      .on('pointerdown', () => this.startQuestionnaireButton.setStyle({ fill: '#a3e4db' }))
      .on('pointerup', () => {
        this.startQuestionnaireButton.setStyle({ fill: '#ff0' });
        window.interactiveCanvas.sendTextQuery('Start questionnaire');
      });


    // Question Text
    this.questionText = new Phaser.GameObjects.Text(this, 0,
      0, 'Question Text', { fontSize: 40, fill: '#000' });
    this.questionText.y = (this.scale.height / 3);
    this.questionText.text = this.questions[0];
    this.questionText.setVisible(false);
    this.updateQuestionText();


    // Result Text
    this.resultText = new Phaser.GameObjects.Text(this, 0,
      0, 'Result', { fontSize: 40, fill: '#000' });
    this.resultText.x = (this.scale.width / 2) - (this.resultText.width / 2);
    this.resultText.y = (this.scale.height / 3);
    this.resultText.setVisible(false);


    // Answer Option 1 Button
    this.answer1Button = new Phaser.GameObjects.Text(this, 0,
      this.scale.height / 2, 'Not at all', { fontSize: 25, fill: '#51716D' });
    this.answer1Button.x = (this.scale.width / 9 * 1.2) - (this.answer1Button.width / 2);
    this.answer1Button.y = (this.scale.height / 3) * 2;
    this.answer1Button
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.answer1Button.setStyle({ fill: '#a3e4db' }))
      .on('pointerout', () => this.answer1Button.setStyle({ fill: '#51716D' }))
      .on('pointerdown', () => this.answer1Button.setStyle({ fill: '#a3e4db' }))
      .on('pointerup', () => {
        this.answer1Button.setStyle({ fill: '#ff0' });
        window.interactiveCanvas.sendTextQuery('Not at all');
      });

    // Answer Option 2 Button
    this.answer2Button = new Phaser.GameObjects.Text(this, 0,
      this.scale.height / 2, 'Several days', { fontSize: 25, fill: '#51716D' });
    this.answer2Button.x = ((this.scale.width / 9) * 3.2) - (this.answer2Button.width / 2);
    this.answer2Button.y = (this.scale.height / 3) * 2;
    this.answer2Button
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.answer2Button.setStyle({ fill: '#a3e4db' }))
      .on('pointerout', () => this.answer2Button.setStyle({ fill: '#51716D' }))
      .on('pointerdown', () => this.answer2Button.setStyle({ fill: '#a3e4db' }))
      .on('pointerup', () => {
        this.answer2Button.setStyle({ fill: '#ff0' });
        window.interactiveCanvas.sendTextQuery('Several days');
      });

    // Answer Option 3 Button
    this.answer3Button = new Phaser.GameObjects.Text(this, 0,
      this.scale.height / 2, 'More than half \n     the days', { fontSize: 25, fill: '#51716D' });
    this.answer3Button.x = ((this.scale.width / 9) * 5.5) - (this.answer3Button.width / 2);
    this.answer3Button.y = (this.scale.height / 3) * 2;
    this.answer3Button
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.answer3Button.setStyle({ fill: '#a3e4db' }))
      .on('pointerout', () => this.answer3Button.setStyle({ fill: '#51716D' }))
      .on('pointerdown', () => this.answer3Button.setStyle({ fill: '#a3e4db' }))
      .on('pointerup', () => {
        this.answer3Button.setStyle({ fill: '#ff0' });
        window.interactiveCanvas.sendTextQuery('More than half the days');
      });

    // Answer Option 4 Button
    this.answer4Button = new Phaser.GameObjects.Text(this, 0,
      this.scale.height / 2, 'Almost every day', { fontSize: 25, fill: '#51716D' });
    this.answer4Button.x = ((this.scale.width / 9) * 7.5) - (this.answer4Button.width / 2);
    this.answer4Button.y = (this.scale.height / 3) * 2;
    this.answer4Button
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.answer4Button.setStyle({ fill: '#a3e4db' }))
      .on('pointerout', () => this.answer4Button.setStyle({ fill: '#51716Ds' }))
      .on('pointerdown', () => this.answer4Button.setStyle({ fill: '#a3e4db' }))
      .on('pointerup', () => {
        this.answer4Button.setStyle({ fill: '#ff0' });
        window.interactiveCanvas.sendTextQuery('Almost every day');
      });

    //Text Progress of Questions
    this.progressText = new Phaser.GameObjects.Text(this, 0,
      0, 'Progress Text', { fontSize: 30, fill: '#000' });
    this.progressText.text = '1/9';
    this.progressText.x = (this.scale.width - 80) - (this.progressText.width / 2);
    this.progressText.y = (this.scale.height -80);
    this.progressText.setVisible(false);


    //add visuals to Scene
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
   * Call to start MentalBuddy.
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
  /**
   * Call to start questionnaire and show question text and answer options.
   */
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

  /**
   * Call to show next question.
   */
  showNextQuestion(nextQuestion) {
    this.confirmationSound.play();
    this.questionText.text = this.questions[nextQuestion - 1];
    this.updateQuestionText();
    this.progressText.text = nextQuestion + '/9';
    this.updateCanvasState();

  }

  /**
   * Call to show result text and hide questionnaire.
   */
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
    this.resultText.size = (this.scale.width - 80) / this.resultText.text.length;
    this.resultText.x = this.scale.width / 2 - (this.resultText.width / 2);
    this.updateCanvasState();
  }

  updateCanvasState() {
    window.interactiveCanvas.setCanvasState({
    });
  }

  /**
   * Call to update position in regard to question text.
   */
  updateQuestionText() {
    this.questionText.size = (this.scale.width - 80) / this.questionText.text.length;
    this.questionText.x = this.scale.width / 2 - (this.questionText.width / 2);
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

