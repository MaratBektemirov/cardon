class Provider {
    id;
    rules = [];

    getRuleForPayment(payment) {
        const eventTimeRes = new Date(payment.eventTimeRes).getTime();

        let i = this.rules.length - 1;
        while (i >= 0) {
            const ruleTime = new Date(this.rules[i].TIME).getTime();

            if (eventTimeRes >= ruleTime) {
                return this.rules[i];
            }

            i--;
        }

        return null;
    }

    addRule(provider) {
        this.rules.push(provider);
        this.rules.sort((a, b) => new Date(b.TIME).getTime() - new Date(a.TIME).getTime());
    }

    constructor(id) {
        this.id = id;
    }
}

module.exports = Provider;