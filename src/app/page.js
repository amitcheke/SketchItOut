"use client"

import { redirect } from 'next/navigation';

export default function Home() {
  console.log("hello")
  redirect('/designer');
}