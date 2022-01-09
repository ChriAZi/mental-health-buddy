const {
  conversation,
  Canvas,
} = require('@assistant/conversation');
const functions = require('firebase-functions');

const app = conversation({ debug: true });


const NEW_GREETING = `Hi, I am your MentalBuddy!`;

const RETURNING_GREETINGS = [`Hey, you're back to MentalBuddy!`,
  `Welcome back to MentalBuddy!`,
  `I'm glad you're back to check on your mental health!`,
  `Hey there, you made it! Let's check on your mental health`];

//Greeting
  app.handle('greeting', (conv) => {
  if (!conv.device.capabilities.includes('INTERACTIVE_CANVAS')) {
    conv.add('Sorry, this device does not support Interactive Canvas!');
    conv.scene.next.name = 'actions.page.END_CONVERSATION';
    return;
  }
  if (conv.user.lastSeenTime === undefined) {
    conv.add(`<speak>${NEW_GREETING}</speak>`);
  } else {
    conv.add(`<speak>${randomArrayItem(RETURNING_GREETINGS)}</speak>`);
  }
  conv.add(`<speak>${NEW_GREETING}</speak>`);
  conv.add('Should we check up on your mental health together?');
});

/**
 * Build transition to begin the explanation
 */
app.handle('buildExplanationTransition', conv => {
  const repeatExplanation = conv.session.params.repeatExplanation;
  let transition;
  const answerIndex = Math.floor(Math.random() * 3);
  if (repeatExplanation) {
    let answerPossibilities = ['A quick reminder:', 'Here are the question options again.', 'You can ask me about the following.'];
    transition = answerPossibilities[answerIndex];
  } else {
    transition = 'Sure, I can understand that you might have a lot of questions and I hope I can answer all of them.';
  }
  conv.session.params.repeatExplanation = false;
  conv.session.params.transition = transition;
});

/**
 * Set explanation to repeat parameter for nice transition
 */
app.handle('setRepeatExplanation', conv => {
  conv.session.params.repeatExplanation = true;
});

/**
 * When StartMentalBuddy is either pressed or said it will send
 * command start MentalBuddy to canvas in order to change screen.
 */
app.handle('startMentalBuddy', conv => {
  conv.add(new Canvas({
    data: {
      command: 'START_MENTALBUDDY',
    },
  }));
});

/**
 * When startQuestionnaire is either pressed or said it will send
 * command start Questionnaire to canvas in order to change screen.
 * Sets parameter for next question and transition.
 */
app.handle('startQuestionnaire', conv => {
  const nextQuestion = 1;
  conv.add(new Canvas({
    data: {
      command: 'START_QUESTIONNAIRE',
    },
  }));
  conv.session.params.nextQuestion = nextQuestion;
  conv.session.params.transition = buildQuestionnaireTransitions(nextQuestion);
});

/**
 * When answer option is either pressed or said it will send
 * command start Questionnaire to canvas in order to change visible question.
 * Saves questionnaire answer in array and generates transistion to next question.
 */
app.handle('handleQuestionnaireAnswers', conv => {
  let currentQuestion = conv.session.params.nextQuestion;
  let nextQuestion = currentQuestion + 1;

  if (currentQuestion <= 9) {
    let questionnaireAnswers = conv.session.params.questionnaireAnswers ? conv.session.params.questionnaireAnswers : new Map();
    questionnaireAnswers[currentQuestion] = (conv.scene.slots["answer_for_q_" + currentQuestion.toString()].value).toLowerCase();
    conv.session.params.questionnaireAnswers = questionnaireAnswers;
    conv.session.params.nextQuestion = nextQuestion;
    if (currentQuestion !== 9) {

      conv.add(new Canvas({
        data: {
          command: 'SHOW_NEXT_QUESTION',
          nextQuestion: nextQuestion,
        },
      }));
      conv.session.params.transition = buildQuestionnaireTransitions(nextQuestion);
    }
  }
});

/**
 * Generates a string for introduce the current question.
 * @param {int} questionIndex 
 * @returns String of transition
 */
function buildQuestionnaireTransitions(questionIndex) {
  let transition;
  let answerPossibilities;

  const answerIndex = Math.floor(Math.random() * 3);
  switch (questionIndex) {
    case 1:
      answerPossibilities = ['Here is the first question.', 'Question number one: ', 'First question: '];
      transition = answerPossibilities[answerIndex];
      break;
    case 2:
      answerPossibilities = ['Okay, here is the second question.', 'Okay, lets continue with the second question.', 'Alright, the next question is.'];
      transition = answerPossibilities[answerIndex];
      break;
    case 3:
      answerPossibilities = ['Okay, lets move to the third question.', 'Okay, now the third question.', 'Alright, question number three: '];
      transition = answerPossibilities[answerIndex];
      break;
    case 4:
      answerPossibilities = ['Three questions done, five more to go.', 'Okay, only five more questions: ', 'Here is question number four.'];
      transition = answerPossibilities[answerIndex];
      break;
    case 5:
      answerPossibilities = ['Here is the fifth question.', 'Question number five: ', 'Fifth question: '];
      transition = answerPossibilities[answerIndex];
      break;
    case 6:
      answerPossibilities = ['Okay, lets move to the sixth question.', 'Okay, now the sixth question.', 'Alright, question number six: '];
      transition = answerPossibilities[answerIndex];
      break;
    case 7:
      answerPossibilities = ['More than half way through, only three more questions.', 'Only three more questions.', 'Great, you are already more than half way through.'];
      transition = answerPossibilities[answerIndex];
      break;
    case 8:
      answerPossibilities = ['Here is the eighth question.', 'Question number eight: ', 'Eighth question: '];
      transition = answerPossibilities[answerIndex];
      break;
    case 9:
      answerPossibilities = ['Now only one question left: ', 'Great, finally the last question: ', 'And the last question: '];
      transition = answerPossibilities[answerIndex];
      break;
    default:
      throw new Error('Could not build questionnaire prompt.');
  }
  return transition;
}

/**
 * Builds transition for specific intents.
 */
app.handle('buildIntentTransitions', conv => {
  let transition;
  let answerPossibilities;
  const answerIndex = Math.floor(Math.random() * 3);
  switch (conv.intent.name) {
    case 'repeatQuestion':
      answerPossibilities = ['The question was: ', 'Here is the question again: ', 'Sure, here it is: '];
      transition = answerPossibilities[answerIndex];
      break;
    case 'answerOptions':
      answerPossibilities = ['Here is the question again: ', 'The question you were answering was: ', 'A quick reminder of the question: '];
      transition = answerPossibilities[answerIndex];
      break;
    case 'cannotUnderstandQuestion':
    case 'preferProfessional':
      answerPossibilities = ['Here is the question again: ', 'The question you were answering was: ', 'A quick reminder of the question: '];
      transition = 'In case you want to continue ' + answerPossibilities[answerIndex];
      break;
    default:
      throw new Error('Could not build intent transition.');
  }
  conv.session.params.transition = transition;
});

/**
 * Adds all questionnaire answers and calculates Score and the right intervention string.
 * Sends command to canvas in order to show result text.
 */
app.handle('calculateQuestionnaireResult', conv => {
  const questionnaireAnswers = conv.session.params.questionnaireAnswers;
  let finalScore = 0;
  Object.keys(questionnaireAnswers).forEach((key) => {
    let value = questionnaireAnswers[key];
    let answerScore = 0;
    switch (value) {
      case 'not at all':
        break;
      case 'several days':
        answerScore = 1;
        break;
      case 'more than half the days':
        answerScore = 2;
        break;
      case 'almost every day':
        answerScore = 3;
        break;
      default:
        throw new Error('Input value not in range of possible answers.');
    }
    finalScore += answerScore;
  });

  let intervention = '';
  switch (true) {
    case finalScore <= 4:
      intervention = 'just enjoy life';
      break;
    case finalScore > 4 && finalScore <= 9:
      intervention = 'do some mindfulness practices';
      break;
    case finalScore > 9:
      intervention = 'see a therapist';
      break;
    default:
      throw new Error('Final score value not in range of possible answers.');
  }
  conv.session.params.finalScore = finalScore;
  conv.session.params.intervention = intervention;

  let resultText = 'Your mental health score is ' + finalScore + ' out of 27. \nI would recommend you to ' + intervention;

   conv.add(new Canvas({
    data: {
      command: 'QUESTIONNAIRE_RESULT',
      resultText: resultText,
    },
  }));
 
});


exports.ActionsOnGoogleFulfillment = functions.https.onRequest(app);
