
/**
 * This class is used as a wrapper for Google Assistant Canvas Action class
 * along with its callbacks.
 */
export class Action {
  /**
   * @param  {Phaser.Scene} scene which serves as a container of all visual
   * and audio elements.
   */
  constructor(scene) {
    this.canvas = window.interactiveCanvas;
    this.mentalBuddyScene = scene;
    this.commands = {
      START_MENTALBUDDY: (params) => {
        this.mentalBuddyScene.startMentalBuddy();
      },
      SHOW_EXPLANATION: (params) => {
        this.mentalBuddyScene.showExplanation();
      },
      START_QUESTIONNAIRE: (params) => {
        this.mentalBuddyScene.startQuestionnaire();
      },
      SHOW_NEXT_QUESTION: (params) => {
        this.mentalBuddyScene.showNextQuestion(params);
      },
      PREPARE_RESULT: (params) => {
        this.mentalBuddyScene.showPreparation(params);
      },
      QUESTIONNAIRE_RESULT: (params) => {
        this.mentalBuddyScene.showResult(params);
      },
    };
  }

  /**
   * Register all callbacks used by the Interactive Canvas Action
   * executed during game creation time.
   */
  setCallbacks() {
    // Declare the Interactive Canvas action callbacks.
    const callbacks = {
      onUpdate: (data) => {
        try {
          const dataEntry = data[0];
          const command = dataEntry.command ? dataEntry.command :
            dataEntry.google ? dataEntry.google.intent.name : null;
          let params = null;
          if (dataEntry.nextQuestion) {
            params = dataEntry.nextQuestion;
          } else if (dataEntry.resultText) {
            params = dataEntry.resultText;
          }
          this.commands[command.toUpperCase()](params);
        } catch (e) {
          // do nothing, when no command is sent or found
        }
      }
    };
    // Called by the Interactive Canvas web app once web app has loaded to
    // register callbacks.
    this.canvas.ready(callbacks);
  }
}
