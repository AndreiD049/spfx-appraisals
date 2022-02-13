import IPeriod from './IPeriod';
import { sp } from '@pnp/sp';
import '@pnp/sp/webs';
import '@pnp/sp/lists';
import '@pnp/sp/items';

const LIST_NAME = 'AppraisalPeriods';
const SELECT = ['ID', 'Title', 'Status', 'Created', 'Author/Title'];
const SELECT_DETAILS = [
    'ID',
    'Title',
    'Status',
    'Created',
    'Author/Title',
    'LockedId',
];
const EXPAND = ['Author'];

export async function getPeriods(): Promise<IPeriod[]> {
    return sp.web.lists
        .getByTitle(LIST_NAME)
        .items.select(...SELECT)
        .expand(...EXPAND)
        .get();
}

export async function getPeriod(id: string): Promise<IPeriod> {
    return sp.web.lists
        .getByTitle(LIST_NAME)
        .items.getById(+id)
        .select(...SELECT_DETAILS)
        .expand(...EXPAND)
        .get();
}

export async function createPeriod(period: Partial<IPeriod>) {
    return sp.web.lists.getByTitle(LIST_NAME).items.add(period);
}

export async function finishPeriod(periodId: string) {
    const period = await getPeriod(periodId);
    if (period.Status === 'Finished') {
        return;
    }
    const update: Partial<IPeriod> = {
        Status: 'Finished',
    };
    const updated = await sp.web.lists
        .getByTitle(LIST_NAME)
        .items.getById(+periodId)
        .update(update);
    return updated.item.get();
}

export async function ChangeLockPeriod(periodId: string, userId: string, value: boolean) {
    const original = await getPeriod(periodId);
    let lockedList = new Set(original.LockedId);
    const numUserId = Number(userId);
    if (!value) {
        /** is already locked */
        lockedList.delete(numUserId);
    } else {
        lockedList.add(numUserId);
    }
    const updated = await sp.web.lists
        .getByTitle(LIST_NAME)
        .items.getById(+periodId)
        .update({
            LockedId: { results: Array.from(lockedList) },
        });
    return updated.item
        .select(...SELECT_DETAILS)
        .expand(...EXPAND)
        .get();
}
