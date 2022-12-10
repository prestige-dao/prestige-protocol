import * as borsh from "borsh";
import { 
    Buffer 
} from "buffer";
import { 
    ConfirmOptions,
    Connection,
    Keypair,
    PublicKey, 
    sendAndConfirmTransaction, 
    SystemProgram,
    Transaction,
    TransactionInstruction 
} from '@solana/web3.js';
import { 
    PrestigeProtocolInstruction 
} from './instruction';
import { 
    getUserPubkey 
} from "../util/seed-util";
import { 
    PRESTIGE_PROGRAM_ID, 
} from "../util";
import { User } from "../state";

export class CreateUser {

    instruction: PrestigeProtocolInstruction;
    name: string;

    constructor(props: {
        instruction: PrestigeProtocolInstruction,
        name: string,
    }) {
        this.instruction = props.instruction;
        this.name = props.name;
    }

    toBuffer() { 
        return Buffer.from(borsh.serialize(CreateUserSchema, this)) 
    }
    
    static fromBuffer(buffer: Buffer) {
        return borsh.deserialize(CreateUserSchema, CreateUser, buffer);
    }
}

export const CreateUserSchema = new Map([
    [ CreateUser, { 
        kind: 'struct', 
        fields: [ 
            ['name', 'string'],
        ],
    }]
]);

export async function createCreateUserInstruction(
    payer: PublicKey,
    authority: PublicKey,
    name: string,
): Promise<[TransactionInstruction, PublicKey]> {

    const userPubkey = (await getUserPubkey(
        authority,
    ))[0];

    const instructionObject = new CreateUser({
        instruction: PrestigeProtocolInstruction.CreateUser,
        name,
    });

    const ix = new TransactionInstruction({
        keys: [
            {pubkey: userPubkey, isSigner: false, isWritable: true},
            {pubkey: authority, isSigner: true, isWritable: true},
            {pubkey: payer, isSigner: true, isWritable: true},
            {pubkey: SystemProgram.programId, isSigner: false, isWritable: false}
        ],
        programId: PRESTIGE_PROGRAM_ID,
        data: instructionObject.toBuffer(),
    });

    return [ix, userPubkey];
}

export async function createUser(
    connection: Connection,
    payer: Keypair,
    authority: PublicKey,
    name: string,
    confirmOptions?: ConfirmOptions
): Promise<PublicKey> {

    const [ix, userPubkey] = await createCreateUserInstruction(
        payer.publicKey,
        authority,
        name,
    );
    await sendAndConfirmTransaction(
        connection,
        new Transaction().add(ix),
        [payer],
        confirmOptions,
    );
    return userPubkey;
}