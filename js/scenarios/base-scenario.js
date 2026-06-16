/**
 * Base Scenario Module
 * Phase 3: ES Module Architecture
 * Abstract base class for all scenarios
 */

export class BaseScenario {
    constructor(name, description) {
        this.name = name;
        this.description = description;
        this.questions = [];
    }

    getQuestions() {
        return this.questions;
    }

    getQuestion(index) {
        return this.questions[index] || null;
    }

    getTotalQuestions() {
        return this.questions.length;
    }

    validateAnswer(questionIndex, selectedOption) {
        const question = this.getQuestion(questionIndex);
        if (!question) return { correct: false, explanation: '' };

        const correct = selectedOption === question.correct;
        return {
            correct,
            explanation: question.explanation || ''
        };
    }
}

export default BaseScenario;
