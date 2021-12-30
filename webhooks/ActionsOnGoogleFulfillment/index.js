const { conversation } = require('@assistant/conversation');
const functions = require('firebase-functions');

const app = conversation();

app.handle('buildExplanationTransition', conv => {
  const repeatExplanation = conv.session.params.repeatExplanation;
  let transition;
  const answerIndex = Math.floor(Math.random() * 3);
  if (repeatExplanation) {
      let answerPossibilities = ['A quick reminder .', 'Here are the question options again.', 'You can ask me about the following.'];
      transition = answerPossibilities[answerIndex];
  } else {
    transition = 'Sure, I can understand that you might have a lot of questions and I hope I can answer all of them.';
  }
  conv.session.params.repeatExplanation = false;
  conv.session.params.transition = transition;
});

app.handle('setRepeatExplanation', conv => {
  conv.session.params.repeatExplanation = true;
});

app.handle('startQuestionnaire', conv => {
  const nextQuestion = 1;
  conv.session.params.nextQuestion = nextQuestion;
  conv.session.params.transition = buildQuestionnaireTransitions(nextQuestion);
});

app.handle('handleQuestionnaireAnswers', conv => {
   let currentQuestion = conv.session.params.nextQuestion;
   let nextQuestion = currentQuestion + 1;
  
   if(currentQuestion !== 9) {
     let questionnaireAnswers = conv.session.params.questionnaireAnswers ? conv.session.params.questionnaireAnswers : new Map();
     questionnaireAnswers[currentQuestion] = (conv.scene.slots["answer_for_q_" + currentQuestion.toString()].value).toLowerCase();
     conv.session.params.questionnaireAnswers = questionnaireAnswers;

     conv.session.params.nextQuestion = nextQuestion;
     conv.session.params.transition = buildQuestionnaireTransitions(nextQuestion);
   }
});

function buildQuestionnaireTransitions(questionIndex) {
  let transition;
  let answerPossibilities;
  const answerIndex = Math.floor(Math.random() * 3);
  switch(questionIndex) {
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

app.handle('buildIntentTransitions', conv => {
  let transition;
  let answerPossibilities;
  const answerIndex = Math.floor(Math.random() * 3);
  switch(conv.intent.name) {
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

app.handle('calculateQuestionnaireResult', conv => {
  const questionnaireAnswers = conv.session.params.questionnaireAnswers;
  let finalScore = 0;
  Object.keys(questionnaireAnswers).forEach((key) => {
    let value = questionnaireAnswers[key];
    let answerScore = 0;
    switch (value){
      case 'not at all':
        break;
      case 'several days':
        answerScore = 1;
        break;
      case 'more than half the days':
        answerScore = 2;
        break;
      case 'nearly every day':
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
      throw new Error ('Final score value not in range of possible answers.');
  }
  conv.session.params.finalScore = finalScore;
  conv.session.params.intervention = intervention;
});


exports.ActionsOnGoogleFulfillment = functions.https.onRequest(app);
