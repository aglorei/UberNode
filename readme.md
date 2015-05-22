# UberNode

Use this as a template for OAuth 2.0 authentication and authorization in order to make requests on behalf of users.

Register your app via [Uber's developer site](https://developer.uber.com/apps/new) (you'll need an Uber account). Make sure to keep track of the client id, client secret, and server token as environment variables. If you're not sure how to do this, look it up!

Keep in mind that there are no database connections here, and all connection and routing logic is written in the entry point. If using a database and/or modularizing your app, write your own logic.

If making ride requests on behalf of users, I would suggest developing within Uber's [sandbox environment](https://developer.uber.com/v1/sandbox/), which makes ephemeral requests (i.e. no actual charge on a credit card).

Don't forget to install your npm dependencies!

[Make sure to reference the Uber API docs!](https://developer.uber.com/v1/endpoints/)

Good luck, hackers! And happy coding!