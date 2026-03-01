import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";



actor {
  type Card = {
    id : Nat;
    cardType : Text;
    title : Text;
    front : Text;
    back : Text;
    trap : ?Text;
    hook : ?Text;
  };

  type Deck = {
    id : Text;
    name : Text;
    description : Text;
    cards : [Card];
  };

  module Deck {
    public func compareById(d1 : Deck, d2 : Deck) : Order.Order {
      Text.compare(d1.id, d2.id);
    };
  };

  let decks = Map.empty<Text, Deck>();

  // Create a deck with all cards at once (for small decks)
  public shared ({ caller }) func saveDeck(id : Text, name : Text, description : Text, cards : [Card]) : async () {
    let deck : Deck = {
      id;
      name;
      description;
      cards;
    };
    decks.add(id, deck);
  };

  // Initialize a deck with empty cards (for chunked upload)
  public shared ({ caller }) func initDeck(id : Text, name : Text, description : Text) : async () {
    let deck : Deck = {
      id;
      name;
      description;
      cards = [];
    };
    decks.add(id, deck);
  };

  // Append a batch of cards to an existing deck (for chunked upload)
  public shared ({ caller }) func appendCards(id : Text, newCards : [Card]) : async () {
    switch (decks.get(id)) {
      case (null) { Runtime.trap("Deck not found") };
      case (?deck) {
        let updatedDeck = {
          deck with
          cards = deck.cards.concat(newCards)
        };
        decks.add(id, updatedDeck);
      };
    };
  };

  public query ({ caller }) func listDecks() : async [Deck] {
    decks.values().toArray().sort(Deck.compareById);
  };

  public shared ({ caller }) func deleteDeck(id : Text) : async () {
    switch (decks.get(id)) {
      case (null) { Runtime.trap("Deck not found") };
      case (?_) { decks.remove(id) };
    };
  };

  public shared ({ caller }) func renameDeck(id : Text, newName : Text) : async () {
    switch (decks.get(id)) {
      case (null) { Runtime.trap("Deck not found") };
      case (?deck) {
        let updatedDeck = { deck with name = newName };
        decks.add(id, updatedDeck);
      };
    };
  };
};
