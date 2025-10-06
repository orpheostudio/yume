import { useEffect } from 'react'

export const useAnalytics = () => {
  useEffect(() => {
    // Microsoft Clarity
    const clarityScript = document.createElement('script')
    clarityScript.type = 'text/javascript'
    clarityScript.innerHTML = `
      (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
      })(window, document, "clarity", "script", "tlya8thx8r");
    `
    document.head.appendChild(clarityScript)

    // Agent Analytics
    const agentScript = document.createElement('script')
    agentScript.innerHTML = `
      !function(){var e=window.ag=window.ag||function(){(ag._=ag._||[]).push(arguments)};e._version="0.0.1";var t=document.createElement("script");t.async=1,t.src="https://cdn.agent.ai/ag.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n)}();
      ag('init', '57aae9f9:20251003:untitled-agent:145f4f35');
      ag('track');
    `
    document.head.appendChild(agentScript)

    // Track app load
    if (typeof clarity !== 'undefined') {
      clarity('event', 'app_loaded')
    }
    if (typeof ag !== 'undefined') {
      ag('track', 'app_loaded')
    }

    return () => {
      document.head.removeChild(clarityScript)
      document.head.removeChild(agentScript)
    }
  }, [])
}
