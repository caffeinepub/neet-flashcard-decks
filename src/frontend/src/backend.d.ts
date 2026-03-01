import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Card {
    id: bigint;
    front: string;
    title: string;
    cardType: string;
    back: string;
    hook?: string;
    trap?: string;
}
export interface Deck {
    id: string;
    cards: Array<Card>;
    name: string;
    description: string;
}
export interface backendInterface {
    appendCards(id: string, newCards: Array<Card>): Promise<void>;
    deleteDeck(id: string): Promise<void>;
    initDeck(id: string, name: string, description: string): Promise<void>;
    listDecks(): Promise<Array<Deck>>;
    renameDeck(id: string, newName: string): Promise<void>;
    saveDeck(id: string, name: string, description: string, cards: Array<Card>): Promise<void>;
}
