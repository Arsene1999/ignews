import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import {query as qFauna} from 'faunadb';
import { fauna } from "../../../services/fauna";

export default NextAuth({
 
  providers: [
    Providers.GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      scope: 'read: user',
    }),
  ],
  callbacks:{
    async signIn(user, account, profile){
      const { email } = user;
     
      
      try{
        await fauna.query(
          qFauna.If(
            qFauna.Not(
              qFauna.Exists(
                qFauna.Match(
                  qFauna.Index("user_by_email"),
                  qFauna.Casefold(user.email)
                )
              )
            ),
            qFauna.Create(
              qFauna.Collection("users"),
              { data: { email } }
            ),
            qFauna.Get(
              qFauna.Match(
                qFauna.Index("user_by_email"),
                qFauna.Casefold(user.email)
              )
            )
          ) 
        )
        return true;
      }
      catch(err)
      {  
        console.log(err)
        return false;
      }
      
    }
  },
})