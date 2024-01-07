import { getIdFromObject, log } from './jUtils.js';
import constants from '../constants.js';

async function getItemFromDb(filter, collection) {
    const filterId = getIdFromObject(filter);

    // Pick one of the random numbers on each record to sort by
    const randomKey = getRandomNumber(1, constants.randomNumbersForCtrlData);
    // Pick a direction randomly as well
    const randomSortDirection = Math.random() > 0.5 ? 1 : -1;

    const filterIdPropertyName = `__ctrl.views.${filterId}`;
    const randomNoPropertyName = `__ctrl.random.${randomKey}`;

    const sort = {
        // Sort by view counts for this filter (always ascending)
        [filterIdPropertyName]: 1,
        // Sort by the selected random number
        [randomNoPropertyName]: randomSortDirection,
    };
    log(`Querying: ${JSON.stringify(filter)}, sort ${JSON.stringify(sort)}`);
    const items = await collection.find(filter).sort(sort).limit(1).toArray();
    const item = items.length ? items[0] : null;

    // Got the item, now update the views metadata.
    if (item) {
        const __ctrl = item.__ctrl;

        if (__ctrl) {
            // Update the views for this filter
            const filterViews = __ctrl.views[filterId] ?? 0;
            __ctrl.views[filterId] = filterViews + 1;

            // Update the total views
            const totalViews = __ctrl.totalViews ?? 0;
            __ctrl.totalViews = totalViews + 1;
            __ctrl.lastView = new Date();
        
            await collection._updateOne(
                { _id: item._id },
                { $set: { __ctrl } }
            );
        }
    }

    return item;
}

function getBlankCtrlField() {    
    return {
        totalViews: 0,
        lastView: null,
        views: {},
        random: getRandomNumbers(constants.randomNumbersForCtrlData),
    };
}

function getRandomNumbers(n) {
    const random = {};

    for (let i = 0; i < n; i++) {
        random[i] = Math.random();        
    }

    return random;
}

function getRandomNumber(n, m) {
    if (!n || !m) {
        return 0;
    }

    const randomNumber = n + Math.random() * (m - n);
    return Math.round(randomNumber);
}

export {
    getBlankCtrlField,
    getItemFromDb,
}