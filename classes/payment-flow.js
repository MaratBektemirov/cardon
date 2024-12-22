class PaymentFlow {
    amount = 0;
    conversion = [];
    time = [];
    commission = [];
    isOk = [];
    id = [];

    constructor(payment) {
        this.payment = payment;
    }

    getProviders() {
        const result = [];

        let j = 0
        while (j < this.isOk.length) {
            if (this.isOk[j]) {
                result.push(this.id[j]);
            }

            j++
        }

        return result;
    }

    execute() {
        const result = {
            time: 0,
            status: 'FAILED',
            provider: null,
            commission: 0,
        }

        let i = 0
        while (i < this.conversion.length) {
            const p = this.conversion[i];
            result.time += this.time[i];

            const r = Math.random();

            if (r <= p) {
                result.status = 'CAPTURED';
                result.provider = this.id[i];
                result.commission = this.payment.amount * this.commission[i];
                break;
            }

            i++;
        }

        return result;
    }
}

module.exports = PaymentFlow;