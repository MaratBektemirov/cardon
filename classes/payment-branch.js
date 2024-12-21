class PaymentBranch {
    byCommision = {};

    constructor() {
    }

    checkRule(rule, payment) {
        return payment.amount >= rule.MIN_SUM && payment.amount <= rule.MAX_SUM;
    }

    addRule(rule, payment) {
        this.byCommision[rule.COMMISSION] = this.byCommision[rule.COMMISSION] || [];
        this.byCommision[rule.COMMISSION].push(Object.assign({ isValid: this.checkRule(rule, payment) }, rule));
        this.byCommision[rule.COMMISSION].sort((a, b) => b.CONVERSION - a.CONVERSION);
    }

    getFlow() {
        const result = {
            isValid: [],
            id: [],
        };

        const keys = Object.keys(this.byCommision).map((v) => +v).sort((a, b) => a - b);

        let i = 0
        while (i < keys.length) {
            const c = keys[i];
            const providersByCommision = this.byCommision[c];

            let j = 0;
            while (j < providersByCommision.length) {
                const provider = providersByCommision[j];
                result.isValid.push(provider.isValid)
                result.id.push(provider.ID);
                j++;
            }

            i++
        }

        return result;
    }
}

module.exports = PaymentBranch;