import { uniqueNamesGenerator, adjectives, colors } from 'unique-names-generator';
import { LOCAL_STORAGE_USER_KEY } from './constants';

function generateRandomNumber() {
    return Math.ceil(Math.random() * 1000000);
}

export function generateRandomUser() {
    const existingUserStr = localStorage?.getItem(LOCAL_STORAGE_USER_KEY);

    if (existingUserStr && false) return JSON.parse(existingUserStr);

    const newUser = {
        id: generateRandomNumber(),
        name: uniqueNamesGenerator({
            dictionaries: [adjectives, colors],
            style: "capital",
            separator: " ",
            length: 2
        })
    }

    localStorage?.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));

    return newUser;
}