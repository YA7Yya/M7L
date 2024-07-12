exports.isEmployee = (req, res, next) => {
  if (req.session.role === "Employee" || req.session.role === "Manager") next();
  else
    res.status(404).send(
      `
    <div title="Error 404" class="ss">Error 404</div>
    
          <style>
          a{
            text-decoration: none
          }
          @import url('https://fonts.googleapis.com/css?family=Fira+Mono:400');
    
    body{ 
      display: flex;
      width: 100vw;
      height: 100vh;
      align-items: center;
      justify-content: center;
      margin: 0;
      background: #131313;
      color: #fff;
      font-size: 96px;
      font-family: 'Fira Mono', monospace;
      letter-spacing: -7px;
    }
    
    .ss{
      animation: glitch 1s linear infinite;
    }
    
    @keyframes glitch{
      2%,64%{
        transform: translate(2px,0) skew(0deg);
      }
      4%,60%{
        transform: translate(-2px,0) skew(0deg);
      }
      62%{
        transform: translate(0,0) skew(5deg); 
      }
    }
    
    .ss:before,
    .ss:after{
      content: attr(title);
      position: absolute;
      left: 0;
    }
    
    .ss:before{
      animation: glitchTop 1s linear infinite;
      clip-path: polygon(0 0, 100% 0, 100% 33%, 0 33%);
      -webkit-clip-path: polygon(0 0, 100% 0, 100% 33%, 0 33%);
    }
    
    @keyframes glitchTop{
      2%,64%{
        transform: translate(2px,-2px);
      }
      4%,60%{
        transform: translate(-2px,2px);
      }
      62%{
        transform: translate(13px,-1px) skew(-13deg); 
      }
    }
    
    .ss:after{
      animation: glitchBotom 1.5s linear infinite;
      clip-path: polygon(0 67%, 100% 67%, 100% 100%, 0 100%);
      -webkit-clip-path: polygon(0 67%, 100% 67%, 100% 100%, 0 100%);
    }
    
    @keyframes glitchBotom{
      2%,64%{
        transform: translate(-2px,0);
      }
      4%,60%{
        transform: translate(-2px,0);
      }
      62%{
        transform: translate(-22px,5px) skew(21deg); 
      }
    }
          </style>
          `
    );
};
exports.notEmployee = (req, res, next) => {
  if (!req.session.isEmployee) next();
  else res.redirect("/");
};
