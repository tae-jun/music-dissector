import { browser } from '$app/environment'


export async function load({ fetch }) {
  if (!browser) return

  const url = 'https://taejun-allinone-demo.s3.ap-northeast-2.amazonaws.com/data/0766_justdance.json.gz'
  try {
    const res = await fetch(url)
    const data = await res.json()
    return data
  }
  catch (error) {
    console.log(error)
  }
}
