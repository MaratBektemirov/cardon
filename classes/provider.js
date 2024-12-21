class Provider {
    id;
    rules = [];
    limitByDay = {};

    getDate(time) {
        return new Date(time).toLocaleString('ru-RU', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
        })
    }

    addPayment(payment) {
        // const date = this.getDate(payment.eventTimeRes);
        // this.limitByDay[date].USED += payment.amount;
    }

    getRuleForPayment(payment) {
        const eventTimeRes = new Date(payment.eventTimeRes).getTime();
        // const date = this.getDate(payment.eventTimeRes);

        let i = this.rules.length - 1;
        while (i >= 0) {
            const rule = this.rules[i];
            const ruleTime = new Date(rule.TIME).getTime();

            if (eventTimeRes >= ruleTime) {
                return rule;

                // if (this.limitByDay[date].USED + payment.amount <= this.limitByDay[date].LIMIT_MAX) {
                //     return rule;
                // } else {
                //     return null;
                // }
            }

            i--;
        }

        return null;
    }

    addRule(provider) {
        this.rules.push(provider);

        // const date = this.getDate(provider.TIME);

        // if (!this.limitByDay[date]) {
        //     this.limitByDay[date] = {
        //         LIMIT_MIN: provider.LIMIT_MIN,
        //         LIMIT_MAX: provider.LIMIT_MAX,
        //         USED: 0,
        //     }
        // }

        this.rules.sort((a, b) => new Date(b.TIME).getTime() - new Date(a.TIME).getTime());
    }

    constructor(id) {
        this.id = id;
    }
}

module.exports = Provider;