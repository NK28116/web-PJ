import { BillingTemplate } from "@/components/templates/BillingTemplate";
import Head from "next/head";

export default function BillingPage() {
  return(
    <>
    <Head>
        <title>請求 - Wyze System</title>
        <meta name="description" content="Wyze System Web Application - Billing" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <BillingTemplate />
    </>
  )
}