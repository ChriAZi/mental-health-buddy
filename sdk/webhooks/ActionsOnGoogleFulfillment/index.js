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

/** 
 * Initial Greeting 
 */
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

  conv.add(new Canvas({
    data: {
      command: 'SHOW_EXPLANATION',
    },
  }));
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
 * Builds transitions for specific intents.
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
    case 'simpleResult':
      answerPossibilities = ['Alright, so here is the short version.', 'I understand and wont give you all the details.', 'No problem, let me give you the simple explanation.'];
      transition = answerPossibilities[answerIndex];
      break;
    case 'detailedResult':
      answerPossibilities = ['Alright, so here is the long version.', 'I understand and will try to give you all the details you want to know.', 'Sure, let me give you the in-depth explanation.'];
      transition = answerPossibilities[answerIndex];
      break;
    case 'repeatResultExplanation':
      answerPossibilities = ['Okay, so let me repeat that for you.', 'No problem, I can just repeat it for you.', 'Sure, here is the explanation again.'];
      transition = answerPossibilities[answerIndex];
      break;
    default:
      throw new Error('Could not build intent transition.');
  }
  conv.session.params.transition = transition;
});

/**
 */
app.handle('showQuestionnaireResult', conv => {
     conv.add(new Canvas({
    data: {
      command: 'QUESTIONNAIRE_RESULT',
      resultText: conv.session.params.resultText,
    },
  }));
});
           
  

/**
 * Adds all questionnaire answers and calculates Score and the right intervention string.
 * Sends command to canvas in order to show result text.
 */
app.handle('calculateQuestionnaireResult', conv => {
  
    conv.add(new Canvas({
   data: {
     command: 'PREPARE_RESULT',
   },
 }));
  
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

  let scoreCategory = '';
  let emotionalResponse = '';
  let intervention = '';
  let interventionBenefits = '';
  let emotionalResponseSummary = '';
  let interventionSummary = '';
  switch (true) {
    case finalScore <= 4:
       scoreCategory = 'having minimal depressive symptoms';
  		 emotionalResponse = 'Depending on what you expected to find out, this might either sound relieving or scary to you. In any case, you dont need to worry too much at this point.';
       intervention = 'observe how your mood changes throughout the days and weeks and come back here to checkup every few weeks.';
       interventionBenefits = 'that you will get a better understanding of your mental health in general and catch possible issues very early on.';
       emotionalResponseSummary = 'Again, this is nothing to worry about for now.';
       interventionSummary = 'Observe your mood and repeat this \ncheckup after a few weeks.';
      break;
    case finalScore > 4 && finalScore <= 9:
       scoreCategory = 'having mild depressive symptoms';
  		 emotionalResponse = 'I can understand that this might sound overwhelming or even scary. However, knowing about the status of your mental health puts you into the position to improve it in the future.';
       intervention = 'try out some evidence-based mindfulness exercises. You could, for example, try some from the Greater Good Science Center website of UC Berkeley or ask your assistant to do a guided meditation on Calm.';
       interventionBenefits = 'that research has repeatedly shown that such exercises can reduce the intensity of symptoms of depression and anxiety. However, if you dont feel any better after two weeks from now, I would still recommend you to book an appointment with a therapist.';
       emotionalResponseSummary = 'Again, this might sound overwhelming but can be dealt with using the right therapeutic intervention.';
       interventionSummary = 'Try some mindfulness exercises and see a \ntherapist in case you don\'t feel any better two weeks from now.';
      break;
    case finalScore > 9:
       scoreCategory = 'medium to severe depressive symptoms';
  		 emotionalResponse = 'I can understand that this might sound very saddening or alarming to you. And you should indeed take this seriously.';
       intervention = 'book an appointment with a therapist in the next day or two. You can ask your assistant to search for therapists near you.';
       interventionBenefits = 'that a professional can take care of your individual situation and help you better navigate this difficult time. Research suggests that there is a good chance of improving your condition using a mixture medication and therapeutic interventions.';
       emotionalResponseSummary = 'Again, this might sound alarming and you should take it seriously. However, as already mentioned there is a good chance for you to improve your situation.';
       interventionSummary = 'Book an appointment with a therapist \n and talk to them about your individual situation.';
      break;
    default:
      throw new Error('Final score value not in range of possible answers.');
  }
  conv.session.params.finalScore = finalScore;
  conv.session.params.scoreCategory = scoreCategory;
  conv.session.params.emotionalResponse = emotionalResponse;
  conv.session.params.intervention = intervention;
  conv.session.params.interventionBenefits = interventionBenefits;
  conv.session.params.emotionalResponseSummary = emotionalResponseSummary;
  conv.session.params.interventionSummary = interventionSummary;
  
  conv.session.params.resultText = 'Score: ' + finalScore + ' out of 27 \nRecommendation: ' + interventionSummary;


});


exports.ActionsOnGoogleFulfillment = functions.https.onRequest(app);
