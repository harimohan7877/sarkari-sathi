import { redirect } from 'next/navigation';

// Redirect old /exams route to new /results route
export default function ExamsRedirect() {
  redirect('/results');
}