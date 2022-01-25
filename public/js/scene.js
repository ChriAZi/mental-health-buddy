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
    this.load.image('statusBarFill', '/assets/ProgressBar.png');
    this.load.image('statusBarEmpty', '/assets/ProgressBarPoints.png');
    this.load.image('progressBar1', '/assets/ProgressBar1.png');
    this.load.image('progressBar2', '/assets/ProgressBar2.png');
    this.load.image('progressBar3', '/assets/ProgressBar3.png');
    this.load.image('progressBar4', '/assets/ProgressBar4.png');
    this.load.image('progressBar5', '/assets/ProgressBar5.png');
    this.load.image('progressBar6', '/assets/ProgressBar6.png');
    this.load.image('progressBar7', '/assets/ProgressBar7.png');
    this.load.image('progressBar8', '/assets/ProgressBar8.png');
    this.load.path = '/assets/';

    /**
     * Sounds
     * Confirmation sound from https://freesound.org/s/330046/
     */
    this.confirmationSound = new Howl({
      src: ['/assets/confirmation.wav'],
      autoplay: false,
      loop: false,
      volume: 1,
    });


    this.questions = ['How often have you been bothered by little \ninterest or pleasure in doing things over \nthe past 2 weeks?',
      'Over the last 2 weeks how often have you been \nfeeling down, depressed, or hopeless?',
      'How often have you had trouble falling or \nstaying asleep, or sleeping too much?',
      'How often have you been feeling tired or \nhaving little energy over the last two weeks?',
      'How often have you had poor appetite or \novereating?',
      'How often have you been feeling bad about \nyourself — or that you are a failure or have let \nyourself or your family down?',
      'Over the last two weeks how often did you have \ntrouble concentrating on things, such as reading \nthe newspaper or watching television?',
      'How often have you been bothered by moving or \nspeaking so slowly that other people could \nhave noticed? Or so fidgety or restless that \nyou have been moving a lot more than usual?',
      'How often have you had thoughts that \nyou would be better off dead, or thoughts of \nhurting yourself in some way?'];

    this.introductionText = ['• 9 questions \n• Based on the Patient Health Questionnaire \n• How often in the last two weeks have you \n   experienced a specific situation?'];
    this.explanationText = ['You can ask me for details about our sessions \nquestionnaire, or tell me to give you an example \nof a question.'];
  }

  /**
   * Called once to create the game along with other objects required
   * to produce the initial state of the game.
   */
  create() {

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
      this.scale.height * 0.7, 'Start MentalBuddy', { fontSize: 35, fill: '#fff', backgroundColor: '#29B2AB' });
    this.startMentalBuddyButton.x = (this.scale.width / 2) - (this.startMentalBuddyButton.width / 2);
    this.startMentalBuddyButton.setPadding(16);
    this.startMentalBuddyButton
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.startMentalBuddyButton.setStyle({ fill: '#a3e4db', backgroundColor: '#278787' }))
      .on('pointerout', () => this.startMentalBuddyButton.setStyle({ fill: '#fff', backgroundColor: '#29B2AB' }))
      .on('pointerdown', () => this.startMentalBuddyButton.setStyle({ fill: '#a3e4db', backgroundColor: '#278787' }))
      .on('pointerup', () => {
        this.startMentalBuddyButton.setStyle({ fill: '#fff', backgroundColor: '#29B2AB' });
        window.interactiveCanvas.sendTextQuery('Start MentalBuddy');
      });


    // Start Questionnaire Button
    this.startQuestionnaireButton = new Phaser.GameObjects.Text(this, 0,
      this.scale.height * 0.7, 'Start Questionnaire', { fontSize: 35, fill: '#fff', backgroundColor: '#29B2AB' });
    this.startQuestionnaireButton.x = (this.scale.width / 4) - (this.startQuestionnaireButton.width / 2);
    this.startQuestionnaireButton.setPadding(16);
    this.startQuestionnaireButton
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.startQuestionnaireButton.setStyle({ fill: '#a3e4db', backgroundColor: '#278787' }))
      .on('pointerout', () => this.startQuestionnaireButton.setStyle({ fill: '#fff', backgroundColor: '#29B2AB' }))
      .on('pointerdown', () => this.startQuestionnaireButton.setStyle({ fill: '#a3e4db', backgroundColor: '#278787' }))
      .on('pointerup', () => {
        this.startQuestionnaireButton.setStyle({ fill: '#fff', backgroundColor: '#29B2AB' });
        window.interactiveCanvas.sendTextQuery('Start questionnaire');
      });

    // Explanation Button
    this.explanationButton = new Phaser.GameObjects.Text(this, 0,
      this.scale.height * 0.7, 'Tell me more', { fontSize: 35, fill: '#fff', backgroundColor: '#29B2AB' });
    this.explanationButton.x = (this.scale.width * 0.75) - (this.explanationButton.width / 2);
    this.explanationButton.setPadding(16);
    this.explanationButton
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.explanationButton.setStyle({ fill: '#a3e4db', backgroundColor: '#278787' }))
      .on('pointerout', () => this.explanationButton.setStyle({ fill: '#fff', backgroundColor: '#29B2AB' }))
      .on('pointerdown', () => this.explanationButton.setStyle({ fill: '#a3e4db', backgroundColor: '#278787' }))
      .on('pointerup', () => {
        this.explanationButton.setStyle({ fill: '#fff', backgroundColor: '#29B2AB' });
        window.interactiveCanvas.sendTextQuery('Detailed explanation');
      });

    // Header Text
    this.headerText = new Phaser.GameObjects.Text(this, 0,
      (this.scale.height * 0.2), 'Welcome', { fontSize: 25, fill: '#d3d3d3' });
    this.headerText.x = (this.scale.width - 30) - this.headerText.width;

    // Description Text
    this.descriptionText = new Phaser.GameObjects.Text(this, 0,
      0, 'Welcome to MentalBuddy!\nShould we check up on your mental health?', { fontSize: 35, fill: '#454545' });
    this.descriptionText.x = (this.scale.width / 2) - (this.descriptionText.width / 2);
    this.descriptionText.y = (this.scale.height * 0.4);


    // Question Text
    this.questionText = new Phaser.GameObjects.Text(this, 0,
      0, 'Question Text', { fontSize: 35, fill: '#454545' });
    this.questionText.y = (this.scale.height * 0.4);
    this.questionText.text = this.questions[0];
    this.questionText.setVisible(false);
    this.updateQuestionText();

    // Answer Option 1 Button
    this.answer1Button = new Phaser.GameObjects.Text(this, 0,
      this.scale.height / 2, 'Not at all', { fontSize: 25, fill: '#fff', backgroundColor: '#29B2AB' });
    this.answer1Button.x = (this.scale.width * 0.1) - (this.answer1Button.width / 2);
    this.answer1Button.y = this.scale.height * 0.7;
    this.answer1Button.setPadding(16);
    this.answer1Button
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.answer1Button.setStyle({ fill: '#a3e4db', backgroundColor: '#278787' }))
      .on('pointerout', () => this.answer1Button.setStyle({ fill: '#fff', backgroundColor: '#29B2AB' }))
      .on('pointerdown', () => this.answer1Button.setStyle({ fill: '#a3e4db', backgroundColor: '#278787' }))
      .on('pointerup', () => {
        this.answer1Button.setStyle({ fill: '#fff', backgroundColor: '#29B2AB' });
        window.interactiveCanvas.sendTextQuery('Not at all');
      });

    // Answer Option 2 Button
    this.answer2Button = new Phaser.GameObjects.Text(this, 0,
      this.scale.height / 2, 'Several days', { fontSize: 25, fill: '#fff', backgroundColor: '#29B2AB' });
    this.answer2Button.x = (this.scale.width * 0.28) - (this.answer2Button.width / 2);;
    this.answer2Button.y = this.scale.height * 0.7;
    this.answer2Button.setPadding(16);
    this.answer2Button
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.answer2Button.setStyle({ fill: '#a3e4db', backgroundColor: '#278787' }))
      .on('pointerout', () => this.answer2Button.setStyle({ fill: '#fff', backgroundColor: '#29B2AB' }))
      .on('pointerdown', () => this.answer2Button.setStyle({ fill: '#a3e4db', backgroundColor: '#278787' }))
      .on('pointerup', () => {
        this.answer2Button.setStyle({ fill: '#fff', backgroundColor: '#29B2AB' });
        window.interactiveCanvas.sendTextQuery('Several days');
      });

    // Answer Option 3 Button
    this.answer3Button = new Phaser.GameObjects.Text(this, 0,
      this.scale.height / 2, 'More than half the days', { fontSize: 25, fill: '#fff', backgroundColor: '#29B2AB' });
    this.answer3Button.x = (this.scale.width * 0.54) - (this.answer3Button.width / 2);;
    this.answer3Button.y = this.scale.height * 0.7;
    this.answer3Button.setPadding(16);
    this.answer3Button
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.answer3Button.setStyle({ fill: '#a3e4db', backgroundColor: '#278787' }))
      .on('pointerout', () => this.answer3Button.setStyle({ fill: '#fff', backgroundColor: '#29B2AB' }))
      .on('pointerdown', () => this.answer3Button.setStyle({ fill: '#a3e4db', backgroundColor: '#278787' }))
      .on('pointerup', () => {
        this.answer3Button.setStyle({ fill: '#fff', backgroundColor: '#29B2AB' });
        window.interactiveCanvas.sendTextQuery('More than half the days');
      });

    // Answer Option 4 Button
    this.answer4Button = new Phaser.GameObjects.Text(this, 0,
      this.scale.height / 2, 'Almost every day', { fontSize: 25, fill: '#fff', backgroundColor: '#29B2AB' });
    this.answer4Button.x = (this.scale.width * 0.82) - (this.answer4Button.width / 2);
    this.answer4Button.y = this.scale.height * 0.7;
    this.answer4Button.setPadding(16);
    this.answer4Button
      .setVisible(false)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => this.answer4Button.setStyle({ fill: '#a3e4db', backgroundColor: '#278787' }))
      .on('pointerout', () => this.answer4Button.setStyle({ fill: '#fff', backgroundColor: '#29B2AB' }))
      .on('pointerdown', () => this.answer4Button.setStyle({ fill: '#a3e4db', backgroundColor: '#278787' }))
      .on('pointerup', () => {
        this.answer4Button.setStyle({ fill: '#fff', backgroundColor: '#29B2AB' });
        window.interactiveCanvas.sendTextQuery('Almost every day');
      });

    //Text Progress of Questions
    /*
    this.progressText = new Phaser.GameObjects.Text(this, 0,
      0, 'Progress Text', { fontSize: 30, fill: '#454545' });
    this.progressText.text = '1/9';
    this.progressText.x = (this.scale.width - 80) - (this.progressText.width / 2);
    this.progressText.y = (this.scale.height - 80);
    this.progressText.setVisible(false);
    */

    this.statusBarEmpty = this.add.image(0, (this.scale.height - 80), 'statusBarEmpty', 'ProgressBarPoints.png', this)
      .setOrigin(0, 0)
      .setVisible(false);
    this.statusBarEmpty.x = (this.scale.width / 2) - (this.statusBarEmpty.width / 2);

    this.statusBarFill = this.add.image(this.statusBarEmpty.x, (this.scale.height - 80), 'statusBarFill', 'ProgressBar.png', this)
      .setOrigin(0, 0)
      .setVisible(false);
    this.progressBar1 = this.add.image(this.statusBarEmpty.x, (this.scale.height - 80), 'progressBar1', 'ProgressBar1.png', this)
      .setOrigin(0, 0)
      .setVisible(false);
    this.progressBar2 = this.add.image(this.statusBarEmpty.x, (this.scale.height - 80), 'progressBar2', 'ProgressBar2.png', this)
      .setOrigin(0, 0)
      .setVisible(false);
    this.progressBar3 = this.add.image(this.statusBarEmpty.x, (this.scale.height - 80), 'progressBar3', 'ProgressBar3.png', this)
      .setOrigin(0, 0)
      .setVisible(false);
    this.progressBar4 = this.add.image(this.statusBarEmpty.x, (this.scale.height - 80), 'progressBar4', 'ProgressBar4.png', this)
      .setOrigin(0, 0)
      .setVisible(false);
    this.progressBar5 = this.add.image(this.statusBarEmpty.x, (this.scale.height - 80), 'progressBar5', 'ProgressBar5.png', this)
      .setOrigin(0, 0)
      .setVisible(false);
    this.progressBar6 = this.add.image(this.statusBarEmpty.x, (this.scale.height - 80), 'progressBar6', 'ProgressBar6.png', this)
      .setOrigin(0, 0)
      .setVisible(false);
    this.progressBar7 = this.add.image(this.statusBarEmpty.x, (this.scale.height - 80), 'progressBar7', 'ProgressBar7.png', this)
      .setOrigin(0, 0)
      .setVisible(false);
    this.progressBar8 = this.add.image(this.statusBarEmpty.x, (this.scale.height - 80), 'progressBar8', 'ProgressBar8.png', this)
      .setOrigin(0, 0)
      .setVisible(false);




    //add visuals to Scene
    this.visibleObjects.push(this.background);
    this.add.existing(this.startMentalBuddyButton);
    this.add.existing(this.startQuestionnaireButton);
    this.add.existing(this.explanationButton);
    this.add.existing(this.headerText);
    this.add.existing(this.questionText);
    this.add.existing(this.descriptionText);
    this.add.existing(this.answer1Button);
    this.add.existing(this.answer2Button);
    this.add.existing(this.answer3Button);
    this.add.existing(this.answer4Button);
    //this.add.existing(this.progressText);
    this.add.existing(this.statusBarEmpty);
    this.add.existing(this.statusBarFill);
    this.add.existing(this.progressBar1);
    this.add.existing(this.progressBar2);
    this.add.existing(this.progressBar3);
    this.add.existing(this.progressBar4);
    this.add.existing(this.progressBar5);
    this.add.existing(this.progressBar6);
    this.add.existing(this.progressBar7);
    this.add.existing(this.progressBar8);



    // Set assistant at game level.
    this.assistant = new Action(this);
    // Call setCallbacks to register assistant action callbacks.
    this.assistant.setCallbacks();
  }

  /**
   * Reset MentalBuddy
   */
  resetMentalBuddy() {
    this.startMentalBuddyButton.setVisible(true);
    this.startQuestionnaireButton.setVisible(false);
    this.explanationButton.setVisible(false);
    this.questionText.setVisible(false);
    this.descriptionText.setVisible(false);
    this.answer1Button.setVisible(false);
    this.answer2Button.setVisible(false);
    this.answer3Button.setVisible(false);
    this.answer4Button.setVisible(false);
    //this.progressText.setVisible(false);
    this.statusBarEmpty.setVisible(false);
    this.statusBarFill.setVisible(false);

    this.questionText.text = this.questions[0];
    //this.progressText.text = '1/9';
    this.updateQuestionText();
    this.updateDescriptionText('Hi I am your MentalBuddy!');
    this.updateCanvasState();
  }

  /**
   * Call to start MentalBuddy.
   */
  startMentalBuddy() {
    this.setVisible(true);
    this.confirmationSound.play();
    this.startMentalBuddyButton.setVisible(false);
    this.startQuestionnaireButton.setVisible(true);
    this.explanationButton.setVisible(true);
    this.descriptionText.setVisible(true);


    this.updateHeaderText('Introduction');
    this.updateDescriptionText(this.introductionText);
    this.updateCanvasState();
  }

  /**
 * Call to show Explanation.
 */
  showExplanation() {
    this.setVisible(true);
    this.confirmationSound.play();
    this.startMentalBuddyButton.setVisible(false);
    this.startQuestionnaireButton.setVisible(true);
    this.explanationButton.setVisible(false);
    this.questionText.setVisible(false);
    this.descriptionText.setVisible(true);

    this.startQuestionnaireButton.x = (this.scale.width / 2) - (this.startQuestionnaireButton.width / 2);
    this.updateHeaderText('Explanation');
    this.updateDescriptionText(this.explanationText);
    this.updateCanvasState();
  }

  /**
   * Call to start questionnaire and show question text and answer options.
   */
  startQuestionnaire() {
    this.setVisible(true);
    this.confirmationSound.play();
    this.startMentalBuddyButton.setVisible(false);
    this.startQuestionnaireButton.setVisible(false);
    this.explanationButton.setVisible(false);
    this.questionText.setVisible(true);
    this.descriptionText.setVisible(false);
    this.answer1Button.setVisible(true);
    this.answer2Button.setVisible(true);
    this.answer3Button.setVisible(true);
    this.answer4Button.setVisible(true);
    //this.progressText.setVisible(true);
    this.statusBarEmpty.setVisible(true);
    this.updateHeaderText('Questionnaire');

    this.updateCanvasState();
  }

  /**
   * Call to show next question.
   */
  showNextQuestion(nextQuestion) {
    this.confirmationSound.play();
    this.questionText.text = this.questions[nextQuestion - 1];
    this.updateQuestionText();
    //this.progressText.text = nextQuestion + '/9';
    this.updateProgressBar(nextQuestion - 1);
    this.updateCanvasState();
  }

  /**
   * Call to show result text and hide questionnaire.
   */
  showPreparation() {
    this.confirmationSound.play();
    this.setVisible(true);
    this.startMentalBuddyButton.setVisible(false);
    this.startQuestionnaireButton.setVisible(false);
    this.explanationButton.setVisible(false);
    this.questionText.setVisible(false);
    this.descriptionText.setVisible(true);
    this.answer1Button.setVisible(false);
    this.answer2Button.setVisible(false);
    this.answer3Button.setVisible(false);
    this.answer4Button.setVisible(false);
    //this.progressText.setVisible(false);
    this.statusBarEmpty.setVisible(false);
    this.statusBarFill.setVisible(false);

    this.updateHeaderText('Preparation');
    this.updateDescriptionText('I am preparing your results. \nAre you ready for them?');
    this.updateCanvasState();
  }
  /**
 * Call to show result text and hide questionnaire.
 */
  showResult(resultString) {
    this.confirmationSound.play();
    this.setVisible(true);
    this.startMentalBuddyButton.setVisible(false);
    this.startQuestionnaireButton.setVisible(false);
    this.explanationButton.setVisible(false);
    this.questionText.setVisible(false);
    this.descriptionText.setVisible(true);
    this.answer1Button.setVisible(false);
    this.answer2Button.setVisible(false);
    this.answer3Button.setVisible(false);
    this.answer4Button.setVisible(false);
    //this.progressText.setVisible(false);
    this.statusBarFill.setVisible(false);
    this.updateHeaderText('Result');
    this.updateDescriptionText(resultString);
    this.updateCanvasState();
  }

  updateCanvasState() {
    window.interactiveCanvas.setCanvasState({
    });
  }

  updateProgressBar(questionIndex) {
    this.progressBar1.setVisible(false);
    this.progressBar2.setVisible(false);
    this.progressBar3.setVisible(false);
    this.progressBar4.setVisible(false);
    this.progressBar5.setVisible(false);
    this.progressBar6.setVisible(false);
    this.progressBar7.setVisible(false);
    this.progressBar8.setVisible(false);
    this.statusBarFill.setVisible(false);

    switch (questionIndex) {
      case 1:
        this.progressBar1.setVisible(true);
        break;
      case 2:
        this.progressBar2.setVisible(true);
        break;
      case 3:
        this.progressBar3.setVisible(true);
        break;
      case 4:
        this.progressBar4.setVisible(true);
        break;
      case 5:
        this.progressBar5.setVisible(true);
        break;
      case 6:
        this.progressBar6.setVisible(true);
        break;
      case 7:
        this.progressBar7.setVisible(true);
        break;
      case 8:
        this.progressBar8.setVisible(true);
        break;
      case 9:
        this.statusBarFill.setVisible(true);
        break;
      default:
        throw new Error('Questionindex out of range.');
    }

  }

  /**
  * Call to update position in regard to description text.
  */
  updateDescriptionText(description) {
    this.descriptionText.text = description;
    this.descriptionText.size = (this.scale.width - 80) / this.descriptionText.text.length;
    this.descriptionText.y = (this.scale.height / 3);
    this.descriptionText.x = this.scale.width / 2 - (this.descriptionText.width / 2);

  }
  /**
* Call to update position in regard to header text.
*/
  updateHeaderText(description) {
    this.headerText.text = description;
    this.headerText.x = (this.scale.width - 30) - this.headerText.width;
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

