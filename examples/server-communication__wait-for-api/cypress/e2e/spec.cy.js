/// <reference types="cypress" />
import { recurse } from "cypress-recurse";
import spok from "cy-spok";
import "cypress-map";

describe("waits for API", () => {
  beforeEach(() => {
    // this call to the API resets the counter
    // the API endpoint /greeting will be available
    // in a random period between 1 and 5 seconds
    cy.request("POST", "/reset-api");
  });

  it("checks API using cypress-recurse", () => {
    cy.visit("/");
    // useful utility for retrying multiple Cypress commands
    // until the predicate function returns true
    // https://github.com/bahmutov/cypress-recurse

    recurse(
      () => {
        return cy.request({
          url: "/greeting",
          failOnStatusCode: false,
        });
      },
      // version 1
      (res) => {
        if (res.isOkStatusCode) {
          cy.wrap(res).should(
            spok({
              body: "Hello!",
              status: 200,
              isOkStatusCode: true,
            })
          );

          return true;
        }

        return false;
      },

      // version 2
      // (res) => {
      //   // Instead of letting spok fail immediately, capture its result
      //   try {
      //     spok({
      //       body: "Hello!",
      //       status: 200,
      //       isOkStatusCode: true,
      //     })(res); // Run spok on the response

      //     return true; // If spok passes, return true
      //   } catch (error) {
      //     return false; // If spok fails, continue recursion
      //   }
      // },
      {
        timeout: 6000, // check API for up to 6 seconds
        delay: 500, // half second pauses between retries
        log: false, // do not log details
      }
    );

    // now the API is ready and we can use the GUI
    cy.get("#get-api-response").click();
    cy.contains("#output", "Hello!").should("be.visible");
  });
});
