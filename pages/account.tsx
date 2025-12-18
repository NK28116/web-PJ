import { AccountTemplate } from "@/components/templates/AccountTemplate";
import Head from "next/head";

export default function AccountPage() {
  return(
    <>
    <Head>
        <title>アカウント情報 - Wyze System</title>
        <meta name="description" content="Wyze System Web Application - Billing" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <AccountTemplate />
    </>
  )
}