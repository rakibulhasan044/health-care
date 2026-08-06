import Stripe from "stripe";
import config from "./index";

export const stripe = new Stripe(config.stripe.stripe_secret_key!);
