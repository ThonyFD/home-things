import {publicIp} from 'public-ip';
import {initializeApp, cert} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';
import fs from 'fs/promises';

import serviceAccount from "./serviceAccountKey.json" assert {type: "json"};

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();
const filePath = 'current-ip.txt';

const readLastIP = async () => {
    let ip = ''
    try {
        ip = await fs.readFile(filePath, 'utf8');
    } catch (error) {
        console.error('Error:', error);
    }

    return ip
}
const saveLastIP = async (ip) => {
    try {
        await fs.writeFile(filePath, ip);
    } catch (error) {
        console.error('Error:', error);
    }
}
const run = async () => {
    try {
        console.log("GETTING PUBLIC IP...")

        const ip = await publicIp()
        const lastIP = await readLastIP()

        console.log("LAST IP:", ip);
        console.log("CURRENT IP:", ip);

        if (ip !== lastIP) {
            await db
                .collection('home-info')
                .doc('network-status')
                .set({
                    currentPublicIP: {
                        value: ip,
                        updatedAt: new Date()
                    }
                }, {merge: true});
            await saveLastIP(ip)
            console.log("UPDATED");
        }
    } catch (err) {
        console.error(err)
    }
}

run().then().catch()
