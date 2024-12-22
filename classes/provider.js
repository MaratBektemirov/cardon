const { getDate } = require("../utils");

class Provider {
    id = null;
    limit = null;
    rules = [];
    limitByDay = {};

    addPayment(payment) {
        this.limitByDay[payment.date].USED += payment.amount;
    }

    getRuleForPayment(payment) {
        const eventTimeRes = new Date(payment.eventTimeRes).getTime();

        let i = this.rules.length - 1;
        while (i >= 0) {
            const rule = this.rules[i];
            const ruleTime = new Date(rule.TIME).getTime();

            if (eventTimeRes >= ruleTime) {
                if (this.limit === 'day-limit') {
                    if ((this.limitByDay[payment.date].USED + payment.amount) <= this.limitByDay[payment.date].LIMIT_MAX) {
                        return rule;
                    } else {
                        return null;
                    }
                } else if (this.limit === 'no-limit') {
                    return rule;
                }
            }

            i--;
        }

        return null;
    }

    addRule(provider) {
        this.rules.push(provider);

        const date = getDate(provider.TIME);

        if (!this.limitByDay[date]) {
            this.limitByDay[date] = {
                LIMIT_MIN: provider.LIMIT_MIN,
                LIMIT_MAX: provider.LIMIT_MAX,
                USED: 0,
            }
        }

        this.rules.sort((a, b) => new Date(b.TIME).getTime() - new Date(a.TIME).getTime());
    }

    constructor(id, limit) {
        this.id = id;
        this.limit = limit;
    }
}

module.exports = Provider;