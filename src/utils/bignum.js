//Code snippets and templates from Decimal.js

;(function (globalScope) {
  "use strict";


  // --  EDITABLE DEFAULTS  -- //
  var Decimal = {

    // The maximum number of arrows accepted in operation.
    // It will warn and then return Infinity if exceeded.
    // This is to prevent loops to not be breaking, and also to prevent memory leaks.
    // 9007199254740991 means operation above {9007199254740991} is disallowed.
    // It is not recommended to make this number too big.
    // `Decimal.maxArrow = 9007199254740991;`
    maxArrow: 9007199254740991,

    // Specify what format is used when serializing for JSON.stringify
    //
    // JSON   0 JSON object
    // STRING 1 String
    serializeMode: 0,

    // Deprecated
    // Level of debug information printed in console
    //
    // NONE   0 Show no information.
    // NORMAL 1 Show operations.
    // ALL    2 Show everything.
    debug: 0
  },


  // -- END OF EDITABLE DEFAULTS -- //


  external = true,

  DecimalError = "[DecimalError] ",
  invalidArgument = DecimalError + "Invalid argument: ",

  isDecimal = /^[-\+]*(Infinity|NaN|(10(\^+|\{[1-9]\d*\})|\(10(\^+|\{[1-9]\d*\})\)\^[1-9]\d* )*((\d+(\.\d*)?|\d*\.\d+)?([Ee][-\+]*))*(0|\d+(\.\d*)?|\d*\.\d+))$/,

  MAX_SAFE_INTEGER = 9007199254740991,
  MAX_E = Math.log10(MAX_SAFE_INTEGER), //15.954589770191003

  // Decimal.prototype object
  P={},
  // Decimal static object
  Q={},
  // Decimal constants
  R={};

  R.ZERO=0;
  R.ONE=1;
  R.E=Math.E;
  R.LN2=Math.LN2;
  R.LN10=Math.LN10;
  R.LOG2E=Math.LOG2E;
  R.LOG10E=Math.LOG10E;
  R.PI=Math.PI;
  R.SQRT1_2=Math.SQRT1_2;
  R.SQRT2=Math.SQRT2;
  R.MAX_SAFE_INTEGER=MAX_SAFE_INTEGER;
  R.MIN_SAFE_INTEGER=Number.MIN_SAFE_INTEGER;
  R.NaN=Number.NaN;
  R.NEGATIVE_INFINITY=Number.NEGATIVE_INFINITY;
  R.POSITIVE_INFINITY=Number.POSITIVE_INFINITY;
  R.E_MAX_SAFE_INTEGER="e"+MAX_SAFE_INTEGER;
  R.EE_MAX_SAFE_INTEGER="ee"+MAX_SAFE_INTEGER;
  R.TETRATED_MAX_SAFE_INTEGER="10^^"+MAX_SAFE_INTEGER;


  // Decimal prototype methods

  P.absoluteValue=P.abs=function(){
    var x=this.clone();
    x.sign=1;
    return x;
  };
  Q.absoluteValue=Q.abs=function(x){
    return new Decimal(x).abs();
  };
  P.negate=P.neg=function (){
    var x=this.clone();
    x.sign=x.sign*-1;
    return x;
  };
  Q.negate=Q.neg=function (x){
    return new Decimal(x).neg();
  };
  P.compareTo=P.cmp=function (other){
    if (!(other instanceof Decimal)) other=new Decimal(other);
    if (isNaN(this.array[0])||isNaN(other.array[0])) return NaN;
    if (this.array[0]==Infinity&&other.array[0]!=Infinity) return this.sign;
    if (this.array[0]!=Infinity&&other.array[0]==Infinity) return -other.sign;
    if (this.array.length==1&&this.array[0]===0&&other.array.length==1&&other.array[0]===0) return 0;
    if (this.sign!=other.sign) return this.sign;
    var m=this.sign;
    var r;
    if (this.array.length>other.array.length) r=1;
    else if (this.array.length<other.array.length) r=-1;
    else{
      for (var i=this.array.length-1;i>=0;--i){
        if (this.array[i]>other.array[i]){
          r=1;
          break;
        }else if (this.array[i]<other.array[i]){
          r=-1;
          break;
        }
      }
      r=r||0;
    }
    return r*m;
  };
  Q.compare=Q.cmp=function (x,y){
    return new Decimal(x).cmp(y);
  };
  P.greaterThan=P.gt=function (other){
    return this.cmp(other)>0;
  };
  Q.greaterThan=Q.gt=function (x,y){
    return new Decimal(x).gt(y);
  };
  P.greaterThanOrEqualTo=P.gte=function (other){
    return this.cmp(other)>=0;
  };
  Q.greaterThanOrEqualTo=Q.gte=function (x,y){
    return new Decimal(x).gte(y);
  };
  P.lessThan=P.lt=function (other){
    return this.cmp(other)<0;
  };
  Q.lessThan=Q.lt=function (x,y){
    return new Decimal(x).lt(y);
  };
  P.lessThanOrEqualTo=P.lte=function (other){
    return this.cmp(other)<=0;
  };
  Q.lessThanOrEqualTo=Q.lte=function (x,y){
    return new Decimal(x).lte(y);
  };
  P.equalsTo=P.equal=P.eq=function (other){
    return this.cmp(other)===0;
  };
  Q.equalsTo=Q.equal=Q.eq=function (x,y){
    return new Decimal(x).eq(y);
  };
  P.notEqualsTo=P.notEqual=P.neq=function (other){
    return this.cmp(other)!==0;
  };
  Q.notEqualsTo=Q.notEqual=Q.neq=function (x,y){
    return new Decimal(x).neq(y);
  };
  P.minimum=P.min=function (other){
    return this.lt(other)?this.clone():new Decimal(other);
  };
  Q.minimum=Q.min=function (x,y){
    return new Decimal(x).min(y);
  };
  P.maximum=P.max=function (other){
    return this.gt(other)?this.clone():new Decimal(other);
  };
  Q.maximum=Q.max=function (x,y){
    return new Decimal(x).max(y);
  };
  P.compareTo_tolerance=P.cmp_tolerance=function (other,tolerance){
    if (!(other instanceof Decimal)) other=new Decimal(other);
    return this.eq_tolerance(other,tolerance)?0:this.cmp(other);
  };
  Q.compare_tolerance=Q.cmp_tolerance=function (x,y,tolerance){
    return new Decimal(x).cmp_tolerance(y,tolerance);
  };
  P.greaterThan_tolerance=P.gt_tolerance=function (other,tolerance){
    if (!(other instanceof Decimal)) other=new Decimal(other);
    return !this.eq_tolerance(other,tolerance)&&this.gt(other);
  };
  Q.greaterThan_tolerance=Q.gt_tolerance=function (x,y,tolerance){
    return new Decimal(x).gt_tolerance(y,tolerance);
  };
  P.greaterThanOrEqualTo_tolerance=P.gte_tolerance=function (other,tolerance){
    if (!(other instanceof Decimal)) other=new Decimal(other);
    return this.eq_tolerance(other,tolerance)||this.gt(other);
  };
  Q.greaterThanOrEqualTo_tolerance=Q.gte_tolerance=function (x,y,tolerance){
    return new Decimal(x).gte_tolerance(y,tolerance);
  };
  P.lessThan_tolerance=P.lt_tolerance=function (other,tolerance){
    if (!(other instanceof Decimal)) other=new Decimal(other);
    return !this.eq_tolerance(other,tolerance)&&this.lt(other);
  };
  Q.lessThan_tolerance=Q.lt_tolerance=function (x,y,tolerance){
    return new Decimal(x).lt_tolerance(y,tolerance);
  };
  P.lessThanOrEqualTo_tolerance=P.lte_tolerance=function (other,tolerance){
    if (!(other instanceof Decimal)) other=new Decimal(other);
    return this.eq_tolerance(other,tolerance)||this.lt(other);
  };
  Q.lessThanOrEqualTo_tolerance=Q.lte_tolerance=function (x,y,tolerance){
    return new Decimal(x).lte_tolerance(y,tolerance);
  };
  //From break_eternity.js
  //https://github.com/Patashu/break_eternity.js/blob/96901974c175cb28f66c7164a5a205cdda783872/src/index.ts#L2802
  P.equalsTo_tolerance=P.equal_tolerance=P.eq_tolerance=function (other,tolerance){
    if (!(other instanceof Decimal)) other=new Decimal(other);
    if (tolerance==null) tolerance=1e-7;
    if (isNaN(this.array[0])||isNaN(other.array[0])||this.isFinite()!=other.isFinite()) return false;
    if (this.sign!=other.sign) return false;
    if (Math.abs(this.array.length-other.array.length)>1) return false;
    var a,b;
    for (var i=Math.max(this.array.length,other.array.length)-1;i>=1;--i){
      var e=this.array[i]||0;
      var f=other.array[i]||0;
      if (Math.abs(e-f)>1) return false;
      else if (e!=f){
        var x,y;
        if (e>f) x=this,y=other;
        else x=other,y=this;
        for (var j=i;--j>1;) if (x.array[j]>0) return false;
        if (i>1&&x.array[1]>1) return false;
        a=x.array[0];
        if (i==1) b=Math.log10(y.array[0]);
        else if (i==2&&y.array[0]>=1e10) b=Math.log10(y.array[1]+2);
        else if (y.array[i-2]>=10) b=Math.log10(y.array[i-1]+1);
        else b=Math.log10(y.array[i-1]);
        break;
      }else if (i==1){
        a=this.array[0];
        b=other.array[0];
      }
    }
    return Math.abs(a-b)<=tolerance*Math.max(Math.abs(a),Math.abs(b));
  };
  Q.equalsTo_tolerance=Q.equal_tolerance=Q.eq_tolerance=function (x,y,tolerance){
    return new Decimal(x).eq_tolerance(y,tolerance);
  };
  P.notEqualsTo_tolerance=P.notEqual_tolerance=P.neq_tolerance=function (other,tolerance){
    return !this.eq_tolerance(other,tolerance);
  };
  Q.notEqualsTo_tolerance=Q.notEqual_tolerance=Q.neq_tolerance=function (x,y,tolerance){
    return new Decimal(x).neq_tolerance(y,tolerance);
  };
  P.isPositive=P.ispos=function (){
    return this.gt(Decimal.ZERO);
  };
  Q.isPositive=Q.ispos=function (x){
    return new Decimal(x).ispos();
  };
  P.isNegative=P.isneg=function (){
    return this.lt(Decimal.ZERO);
  };
  Q.isNegative=Q.isneg=function (x){
    return new Decimal(x).isneg();
  };
  P.isNaN=function (){
    return isNaN(this.array[0]);
  };
  Q.isNaN=function (x){
    return new Decimal(x).isNaN();
  };
  P.isFinite=function (){
    return isFinite(this.array[0]);
  };
  Q.isFinite=function (x){
    return new Decimal(x).isFinite();
  };
  P.isInfinite=function (){
    return this.array[0]==Infinity;
  };
  Q.isInfinite=function (x){
    return new Decimal(x).isInfinite();
  };
  P.isInteger=P.isint=function (){
    if (this.sign==-1) return this.abs().isint();
    if (this.gt(Decimal.MAX_SAFE_INTEGER)) return true;
    return Number.isInteger(this.toNumber());
  };
  Q.isInteger=Q.isint=function (x){
    return new Decimal(x).isint();
  };
  P.floor=function (){
    if (this.isInteger()) return this.clone();
    return new Decimal(Math.floor(this.toNumber()));
  };
  Q.floor=function (x){
    return new Decimal(x).floor();
  };
  P.ceiling=P.ceil=function (){
    if (this.isInteger()) return this.clone();
    return new Decimal(Math.ceil(this.toNumber()));
  };
  Q.ceiling=Q.ceil=function (x){
    return new Decimal(x).ceil();
  };
  P.round=function (){
    if (this.isInteger()) return this.clone();
    return new Decimal(Math.round(this.toNumber()));
  };
  Q.round=function (x){
    return new Decimal(x).round();
  };
  var debugMessageSent=false;
  P.plus=P.add=function (other){
    var x=this.clone();
    other=new Decimal(other);
    if (Decimal.debug>=Decimal.NORMAL){
      console.log(this+"+"+other);
      if (!debugMessageSent) console.warn(DecimalError+"Debug output via 'debug' is being deprecated and will be removed in the future!"),debugMessageSent=true;
    }
    if (x.sign==-1) return x.neg().add(other.neg()).neg();
    if (other.sign==-1) return x.sub(other.neg());
    if (x.eq(Decimal.ZERO)) return other;
    if (other.eq(Decimal.ZERO)) return x;
    if (x.isNaN()||other.isNaN()||x.isInfinite()&&other.isInfinite()&&x.eq(other.neg())) return Decimal.NaN.clone();
    if (x.isInfinite()) return x;
    if (other.isInfinite()) return other;
    var p=x.min(other);
    var q=x.max(other);
    var t;
    if (q.gt(Decimal.E_MAX_SAFE_INTEGER)||q.div(p).gt(Decimal.MAX_SAFE_INTEGER)){
      t=q;
    }else if (!q.array[1]){
      t=new Decimal(x.toNumber()+other.toNumber());
    }else if (q.array[1]==1){
      var a=p.array[1]?p.array[0]:Math.log10(p.array[0]);
      t=new Decimal([a+Math.log10(Math.pow(10,q.array[0]-a)+1),1]);
    }
    p=q=null;
    return t;
  };
  Q.plus=Q.add=function (x,y){
    return new Decimal(x).add(y);
  };
  P.minus=P.sub=function (other){
    var x=this.clone();
    other=new Decimal(other);
    if (Decimal.debug>=Decimal.NORMAL) console.log(x+"-"+other);
    if (x.sign==-1) return x.neg().sub(other.neg()).neg();
    if (other.sign==-1) return x.add(other.neg());
    if (x.eq(other)) return Decimal.ZERO.clone();
    if (other.eq(Decimal.ZERO)) return x;
    if (x.isNaN()||other.isNaN()||x.isInfinite()&&other.isInfinite()) return Decimal.NaN.clone();
    if (x.isInfinite()) return x;
    if (other.isInfinite()) return other.neg();
    var p=x.min(other);
    var q=x.max(other);
    var n=other.gt(x);
    var t;
    if (q.gt(Decimal.E_MAX_SAFE_INTEGER)||q.div(p).gt(Decimal.MAX_SAFE_INTEGER)){
      t=q;
      t=n?t.neg():t;
    }else if (!q.array[1]){
      t=new Decimal(x.toNumber()-other.toNumber());
    }else if (q.array[1]==1){
      var a=p.array[1]?p.array[0]:Math.log10(p.array[0]);
      t=new Decimal([a+Math.log10(Math.pow(10,q.array[0]-a)-1),1]);
      t=n?t.neg():t;
    }
    p=q=null;
    return t;
  };
  Q.minus=Q.sub=function (x,y){
    return new Decimal(x).sub(y);
  };
  P.times=P.mul=function (other){
    var x=this.clone();
    other=new Decimal(other);
    if (Decimal.debug>=Decimal.NORMAL) console.log(x+"*"+other);
    if (x.sign*other.sign==-1) return x.abs().mul(other.abs()).neg();
    if (x.sign==-1) return x.abs().mul(other.abs());
    if (x.isNaN()||other.isNaN()||x.eq(Decimal.ZERO)&&other.isInfinite()||x.isInfinite()&&other.abs().eq(Decimal.ZERO)) return Decimal.NaN.clone();
    if (other.eq(Decimal.ZERO)) return Decimal.ZERO.clone();
    if (other.eq(Decimal.ONE)) return x.clone();
    if (x.isInfinite()) return x;
    if (other.isInfinite()) return other;
    if (x.max(other).gt(Decimal.EE_MAX_SAFE_INTEGER)) return x.max(other);
    var n=x.toNumber()*other.toNumber();
    if (n<=MAX_SAFE_INTEGER) return new Decimal(n);
    return Decimal.pow(10,x.log10().add(other.log10()));
  };
  Q.times=Q.mul=function (x,y){
    return new Decimal(x).mul(y);
  };
  P.divide=P.div=function (other){
    var x=this.clone();
    other=new Decimal(other);
    if (Decimal.debug>=Decimal.NORMAL) console.log(x+"/"+other);
    if (x.sign*other.sign==-1) return x.abs().div(other.abs()).neg();
    if (x.sign==-1) return x.abs().div(other.abs());
    if (x.isNaN()||other.isNaN()||x.isInfinite()&&other.isInfinite()||x.eq(Decimal.ZERO)&&other.eq(Decimal.ZERO)) return Decimal.NaN.clone();
    if (other.eq(Decimal.ZERO)) return Decimal.POSITIVE_INFINITY.clone();
    if (other.eq(Decimal.ONE)) return x.clone();
    if (x.eq(other)) return Decimal.ONE.clone();
    if (x.isInfinite()) return x;
    if (other.isInfinite()) return Decimal.ZERO.clone();
    if (x.max(other).gt(Decimal.EE_MAX_SAFE_INTEGER)) return x.gt(other)?x.clone():Decimal.ZERO.clone();
    var n=x.toNumber()/other.toNumber();
    if (n<=MAX_SAFE_INTEGER) return new Decimal(n);
    var pw=Decimal.pow(10,x.log10().sub(other.log10()));
    var fp=pw.floor();
    if (pw.sub(fp).lt(new Decimal(1e-9))) return fp;
    return pw;
  };
  Q.divide=Q.div=function (x,y){
    return new Decimal(x).div(y);
  };
  P.reciprocate=P.rec=function (){
    if (Decimal.debug>=Decimal.NORMAL) console.log(this+"^-1");
    if (this.isNaN()||this.eq(Decimal.ZERO)) return Decimal.NaN.clone();
    if (this.abs().gt("2e323")) return Decimal.ZERO.clone();
    return new Decimal(1/this);
  };
  Q.reciprocate=Q.rec=function (x){
    return new Decimal(x).rec();
  };
  P.modular=P.mod=function (other){
    other=new Decimal(other);
    if (other.eq(Decimal.ZERO)) return Decimal.ZERO.clone();
    if (this.sign*other.sign==-1) return this.abs().mod(other.abs()).neg();
    if (this.sign==-1) return this.abs().mod(other.abs());
    return this.sub(this.div(other).floor().mul(other));
  };
  Q.modular=Q.mod=function (x,y){
    return new Decimal(x).mod(y);
  };
  //All of these are from Patashu's break_eternity.js
  //from HyperCalc source code
  var f_gamma=function (n){
    if (!isFinite(n)) return n;
    if (n<-50){
      if (n==Math.trunc(n)) return Number.NEGATIVE_INFINITY;
      return 0;
    }
    var scal1=1;
    while (n<10){
      scal1=scal1*n;
      ++n;
    }
    n-=1;
    var l=0.9189385332046727; //0.5*Math.log(2*Math.PI)
    l+=(n+0.5)*Math.log(n);
    l-=n;
    var n2=n*n;
    var np=n;
    l+=1/(12*np);
    np*=n2;
    l-=1/(360*np);
    np*=np*n2;
    l+=1/(1260*np);
    np*=n2;
    l-=1/(1680*np);
    np*=n2;
    l+=1/(1188*np);
    np*=n2;
    l-=691/(360360*np);
    np*=n2;
    l+=7/(1092*np);
    np*=n2;
    l-=3617/(122400*np);
    return Math.exp(l)/scal1;
  };
  //from HyperCalc source code
  P.gamma=function (){
    var x=this.clone();
    if (x.gt(Decimal.TETRATED_MAX_SAFE_INTEGER)) return x;
    if (x.gt(Decimal.E_MAX_SAFE_INTEGER)) return Decimal.exp(x);
    if (x.gt(Decimal.MAX_SAFE_INTEGER)) return Decimal.exp(Decimal.mul(x,Decimal.ln(x).sub(1)));
    var n=x.array[0];
    if (n>1){
      if (n<24) return new Decimal(f_gamma(x.sign*n));
      var t=n-1;
      var l=0.9189385332046727; //0.5*Math.log(2*Math.PI)
      l+=((t+0.5)*Math.log(t));
      l-=t;
      var n2=t*t;
      var np=t;
      var lm=12*np;
      var adj=1/lm;
      var l2=l+adj;
      if (l2==l) return Decimal.exp(l);
      l=l2;
      np*=n2;
      lm=360*np;
      adj=1/lm;
      l2=l-adj;
      if (l2==l) return Decimal.exp(l);
      l=l2;
      np*=n2;
      lm=1260*np;
      var lt=1/lm;
      l+=lt;
      np*=n2;
      lm=1680*np;
      lt=1/lm;
      l-=lt;
      return Decimal.exp(l);
    }else return this.rec();
  };
  Q.gamma=function (x){
    return new Decimal(x).gamma();
  };
  //end break_eternity.js excerpt
  Q.factorials=[1,1,2,6,24,120,720,5040,40320,362880,3628800,39916800,479001600,6227020800,87178291200,1307674368000,20922789888000,355687428096000,6402373705728000,121645100408832000,2432902008176640000,51090942171709440000,1.1240007277776076800e+21,2.5852016738884978213e+22,6.2044840173323941000e+23,1.5511210043330986055e+25,4.0329146112660565032e+26,1.0888869450418351940e+28,3.0488834461171387192e+29,8.8417619937397018986e+30,2.6525285981219106822e+32,8.2228386541779224302e+33,2.6313083693369351777e+35,8.6833176188118859387e+36,2.9523279903960415733e+38,1.0333147966386145431e+40,3.7199332678990125486e+41,1.3763753091226345579e+43,5.2302261746660111714e+44,2.0397882081197444123e+46,8.1591528324789768380e+47,3.3452526613163807956e+49,1.4050061177528799549e+51,6.0415263063373834074e+52,2.6582715747884488694e+54,1.1962222086548018857e+56,5.5026221598120891536e+57,2.5862324151116817767e+59,1.2413915592536072528e+61,6.0828186403426752249e+62,3.0414093201713375576e+64,1.5511187532873821895e+66,8.0658175170943876846e+67,4.2748832840600254848e+69,2.3084369733924137924e+71,1.2696403353658276447e+73,7.1099858780486348103e+74,4.0526919504877214100e+76,2.3505613312828784949e+78,1.3868311854568983861e+80,8.3209871127413898951e+81,5.0758021387722483583e+83,3.1469973260387939390e+85,1.9826083154044400850e+87,1.2688693218588416544e+89,8.2476505920824715167e+90,5.4434493907744306945e+92,3.6471110918188683221e+94,2.4800355424368305480e+96,1.7112245242814129738e+98,1.1978571669969892213e+100,8.5047858856786230047e+101,6.1234458376886084639e+103,4.4701154615126843855e+105,3.3078854415193862416e+107,2.4809140811395399745e+109,1.8854947016660503806e+111,1.4518309202828587210e+113,1.1324281178206296794e+115,8.9461821307829757136e+116,7.1569457046263805709e+118,5.7971260207473678414e+120,4.7536433370128420198e+122,3.9455239697206587884e+124,3.3142401345653531943e+126,2.8171041143805501310e+128,2.4227095383672734128e+130,2.1077572983795278544e+132,1.8548264225739843605e+134,1.6507955160908460244e+136,1.4857159644817615149e+138,1.3520015276784029158e+140,1.2438414054641308179e+142,1.1567725070816415659e+144,1.0873661566567430754e+146,1.0329978488239059305e+148,9.9167793487094964784e+149,9.6192759682482120384e+151,9.4268904488832479837e+153,9.3326215443944153252e+155,9.3326215443944150966e+157,9.4259477598383598816e+159,9.6144667150351270793e+161,9.9029007164861804721e+163,1.0299016745145628100e+166,1.0813967582402909767e+168,1.1462805637347083683e+170,1.2265202031961380050e+172,1.3246418194518290179e+174,1.4438595832024936625e+176,1.5882455415227430287e+178,1.7629525510902445874e+180,1.9745068572210740115e+182,2.2311927486598137657e+184,2.5435597334721876552e+186,2.9250936934930159967e+188,3.3931086844518980862e+190,3.9699371608087210616e+192,4.6845258497542909237e+194,5.5745857612076058231e+196,6.6895029134491271205e+198,8.0942985252734440920e+200,9.8750442008336010580e+202,1.2146304367025329301e+205,1.5061417415111409314e+207,1.8826771768889261129e+209,2.3721732428800468512e+211,3.0126600184576594309e+213,3.8562048236258040716e+215,4.9745042224772874590e+217,6.4668554892204741474e+219,8.4715806908788206314e+221,1.1182486511960043298e+224,1.4872707060906857134e+226,1.9929427461615187928e+228,2.6904727073180504073e+230,3.6590428819525488642e+232,5.0128887482749919605e+234,6.9177864726194885808e+236,9.6157231969410893532e+238,1.3462012475717525742e+241,1.8981437590761708898e+243,2.6953641378881628530e+245,3.8543707171800730787e+247,5.5502938327393044385e+249,8.0479260574719917061e+251,1.1749972043909107097e+254,1.7272458904546389230e+256,2.5563239178728653927e+258,3.8089226376305697893e+260,5.7133839564458546840e+262,8.6272097742332399855e+264,1.3113358856834524492e+267,2.0063439050956822953e+269,3.0897696138473507759e+271,4.7891429014633940780e+273,7.4710629262828942235e+275,1.1729568794264144743e+278,1.8532718694937349890e+280,2.9467022724950384028e+282,4.7147236359920616095e+284,7.5907050539472189932e+286,1.2296942187394494177e+289,2.0044015765453026266e+291,3.2872185855342959088e+293,5.4239106661315886750e+295,9.0036917057784375454e+297,1.5036165148649991456e+300,2.5260757449731984219e+302,4.2690680090047051083e+304,7.2574156153079990350e+306];
  P.factorial=P.fact=function (){
    var x=this.clone();
    var f=Decimal.factorials;
    if (x.lt(Decimal.ZERO)||!x.isint()) return x.add(1).gamma();
    if (x.lte(170)) return new Decimal(f[+x]);
    var errorFixer=1;
    var e=+x;
    if (e<500) e+=163879/209018880*Math.pow(e,5);
    if (e<1000) e+=-571/2488320*Math.pow(e,4);
    if (e<50000) e+=-139/51840*Math.pow(e,3);
    if (e<1e7) e+=1/288*Math.pow(e,2);
    if (e<1e20) e+=1/12*e;
    return x.div(Decimal.E).pow(x).mul(x.mul(Decimal.PI).mul(2).sqrt()).times(errorFixer);
  };
  Q.factorial=Q.fact=function (x){
    return new Decimal(x).fact();
  };
  P.toPower=P.pow=function (other){
    other=new Decimal(other);
    if (Decimal.debug>=Decimal.NORMAL) console.log(this+"^"+other);
    if (other.eq(Decimal.ZERO)) return Decimal.ONE.clone();
    if (other.eq(Decimal.ONE)) return this.clone();
    if (other.lt(Decimal.ZERO)) return this.pow(other.neg()).rec();
    if (this.lt(Decimal.ZERO)&&other.isint()){
      if (other.mod(2).lt(Decimal.ONE)) return this.abs().pow(other);
      return this.abs().pow(other).neg();
    }
    if (this.lt(Decimal.ZERO)) return Decimal.NaN.clone();
    if (this.eq(Decimal.ONE)) return Decimal.ONE.clone();
    if (this.eq(Decimal.ZERO)) return Decimal.ZERO.clone();
    if (this.max(other).gt(Decimal.TETRATED_MAX_SAFE_INTEGER)) return this.max(other);
    if (this.eq(10)){
      if (other.gt(Decimal.ZERO)){
        other.array[1]=(other.array[1]+1)||1;
        other.normalize();
        return other;
      }else{
        return new Decimal(Math.pow(10,other.toNumber()));
      }
    }
    if (other.lt(Decimal.ONE)) return this.root(other.rec());
    var n=Math.pow(this.toNumber(),other.toNumber());
    if (n<=MAX_SAFE_INTEGER) return new Decimal(n);
    return Decimal.pow(10,this.log10().mul(other));
  };
  Q.toPower=Q.pow=function (x,y){
    return new Decimal(x).pow(y);
  };
  P.exponential=P.exp=function (){
    return Decimal.pow(Math.E,this);
  };
  Q.exponential=Q.exp=function (x){
    return Decimal.pow(Math.E,x);
  };
  P.squareRoot=P.sqrt=function (){
    return this.root(2);
  };
  Q.squareRoot=Q.sqrt=function (x){
    return new Decimal(x).root(2);
  };
  P.cubeRoot=P.cbrt=function (){
    return this.root(3);
  };
  Q.cubeRoot=Q.cbrt=function (x){
    return new Decimal(x).root(3);
  };
  P.root=function (other){
    other=new Decimal(other);
    if (Decimal.debug>=Decimal.NORMAL) console.log(this+"root"+other);
    if (other.eq(Decimal.ONE)) return this.clone();
    if (other.lt(Decimal.ZERO)) return this.root(other.neg()).rec();
    if (other.lt(Decimal.ONE)) return this.pow(other.rec());
    if (this.lt(Decimal.ZERO)&&other.isint()&&other.mod(2).eq(Decimal.ONE)) return this.neg().root(other).neg();
    if (this.lt(Decimal.ZERO)) return Decimal.NaN.clone();
    if (this.eq(Decimal.ONE)) return Decimal.ONE.clone();
    if (this.eq(Decimal.ZERO)) return Decimal.ZERO.clone();
    if (this.max(other).gt(Decimal.TETRATED_MAX_SAFE_INTEGER)) return this.gt(other)?this.clone():Decimal.ZERO.clone();
    return Decimal.pow(10,this.log10().div(other));
  };
  Q.root=function (x,y){
    return new Decimal(x).root(y);
  };
  P.generalLogarithm=P.log10=function (){
    var x=this.clone();
    if (Decimal.debug>=Decimal.NORMAL) console.log("log"+this);
    if (x.lt(Decimal.ZERO)) return Decimal.NaN.clone();
    if (x.eq(Decimal.ZERO)) return Decimal.NEGATIVE_INFINITY.clone();
    if (x.lte(Decimal.MAX_SAFE_INTEGER)) return new Decimal(Math.log10(x.toNumber()));
    if (!x.isFinite()) return x;
    if (x.gt(Decimal.TETRATED_MAX_SAFE_INTEGER)) return x;
    x.array[1]--;
    return x.normalize();
  };
  Q.generalLogarithm=Q.log10=function (x){
    return new Decimal(x).log10();
  };
  P.logarithm=P.logBase=function (base){
    if (base===undefined) base=Math.E;
    return this.log10().div(Decimal.log10(base));
  };
  Q.logarithm=Q.logBase=function (x,base){
    return new Decimal(x).logBase(base);
  };
  P.naturalLogarithm=P.log=P.ln=function (){
    return this.logBase(Math.E);
  };
  Q.naturalLogarithm=Q.log=Q.ln=function (x){
    return new Decimal(x).ln();
  };
  //All of these are from Patashu's break_eternity.js
  var OMEGA=0.56714329040978387299997;  //W(1,0)
  //from https://math.stackexchange.com/a/465183
  //The evaluation can become inaccurate very close to the branch point
  var f_lambertw=function (z,tol,principal){
    if (tol===undefined) tol=1e-10;
    if (principal===undefined) principal=true;
    var w;
    if (!Number.isFinite(z)) return z;
    if (principal){
      if (z===0) return z;
      if (z===1) return OMEGA;
      if (z<10) w=0;
      else w=Math.log(z)-Math.log(Math.log(z));
    }else{
      if (z===0) return -Infinity;
      if (z<=-0.1) w=-2;
      else w=Math.log(-z)-Math.log(-Math.log(-z));
    }
    for (var i=0;i<100;++i){
      var wn=(z*Math.exp(-w)+w*w)/(w+1);
      if (Math.abs(wn-w)<tol*Math.abs(wn)) return wn;
      w=wn;
    }
    throw Error("Iteration failed to converge: "+z);
  };
  //from https://github.com/scipy/scipy/blob/8dba340293fe20e62e173bdf2c10ae208286692f/scipy/special/lambertw.pxd
  //The evaluation can become inaccurate very close to the branch point
  //at ``-1/e``. In some corner cases, `lambertw` might currently
  //fail to converge, or can end up on the wrong branch.
  var d_lambertw=function (z,tol,principal){
    if (tol===undefined) tol=1e-10;
    if (principal===undefined) principal=true;
    z=new Decimal(z);
    var w;
    if (!z.isFinite()) return z;
    if (principal){
      if (z.eq(Decimal.ZERO)) return z;
      if (z.eq(Decimal.ONE)) return new Decimal(OMEGA);
      w=Decimal.ln(z);
    }else{
      if (z.eq(Decimal.ZERO)) return Decimal.NEGATIVE_INFINITY.clone();
      w=Decimal.ln(z.neg());
    }
    for (var i=0;i<100;++i){
      var ew=w.neg().exp();
      var wewz=w.sub(z.mul(ew));
      var dd=w.add(Decimal.ONE).sub(w.add(2).mul(wewz).div(Decimal.mul(2,w).add(2)));
      if (dd.eq(Decimal.ZERO)) return w; //Escape to fix https://github.com/Naruyoko/ExpantaNum.js/issues/25
      var wn=w.sub(wewz.div(dd));
      if (Decimal.abs(wn.sub(w)).lt(Decimal.abs(wn).mul(tol))) return wn;
      w = wn;
    }
    throw Error("Iteration failed to converge: "+z);
  };
  //The Lambert W function, also called the omega function or product logarithm, is the solution W(x) === x*e^x.
  //https://en.wikipedia.org/wiki/Lambert_W_function
  //Some special values, for testing: https://en.wikipedia.org/wiki/Lambert_W_function#Special_values
  P.lambertw=function (principal){
    if (principal===undefined) principal=true;
    var x=this.clone();
    if (x.isNaN()) return x;
    if (x.lt(-0.3678794411710499)) return Decimal.NaN.clone();
    if (principal){
      if (x.gt(Decimal.TETRATED_MAX_SAFE_INTEGER)) return x;
      if (x.gt(Decimal.EE_MAX_SAFE_INTEGER)){
        x.array[1]--;
        return x;
      }
      if (x.gt(Decimal.MAX_SAFE_INTEGER)) return d_lambertw(x);
      else return new Decimal(f_lambertw(x.sign*x.array[0]));
    }else{
      if (x.ispos()) return Decimal.NaN.clone();
      if (x.abs().gt(Decimal.EE_MAX_SAFE_INTEGER)) return x.neg().recip().lambertw().neg();
      if (x.abs().gt(Decimal.MAX_SAFE_INTEGER)) return d_lambertw(x,1e-10,false);
      else return new Decimal(f_lambertw(x.sign*x.array[0],1e-10,false));
    }
  };
  Q.lambertw=function (x,principal){
    return new Decimal(x).lambertw(principal);
  };
  //end break_eternity.js excerpt
  //Uses linear approximations for real height
  P.tetrate=P.tetr=function (other,payload){
    if (payload===undefined) payload=Decimal.ONE;
    var t=this.clone();
    other=new Decimal(other);
    payload=new Decimal(payload);
    if (payload.neq(Decimal.ONE)) other=other.add(payload.slog(t));
    if (Decimal.debug>=Decimal.NORMAL) console.log(t+"^^"+other);
    var negln;
    if (t.isNaN()||other.isNaN()||payload.isNaN()) return Decimal.NaN.clone();
    if (other.isInfinite()&&other.sign>0){
      if (t.gte(Math.exp(1/Math.E))) return Decimal.POSITIVE_INFINITY.clone();
      //Formula for infinite height power tower.
      negln = t.ln().neg();
      return negln.lambertw().div(negln);
    }
    if (other.lte(-2)) return Decimal.NaN.clone();
    if (t.eq(Decimal.ZERO)){
      if (other.eq(Decimal.ZERO)) return Decimal.NaN.clone();
      if (other.mod(2).eq(Decimal.ZERO)) return Decimal.ZERO.clone();
      return Decimal.ONE.clone();
    }
    if (t.eq(Decimal.ONE)){
      if (other.eq(Decimal.ONE.neg())) return Decimal.NaN.clone();
      return Decimal.ONE.clone();
    }
    if (other.eq(Decimal.ONE.neg())) return Decimal.ZERO.clone();
    if (other.eq(Decimal.ZERO)) return Decimal.ONE.clone();
    if (other.eq(Decimal.ONE)) return t;
    if (other.eq(2)) return t.pow(t);
    if (t.eq(2)){
      if (other.eq(3)) return new Decimal(16);
      if (other.eq(4)) return new Decimal(65536);
    }
    var m=t.max(other);
    if (m.gt("10^^^"+MAX_SAFE_INTEGER)) return m;
    if (m.gt(Decimal.TETRATED_MAX_SAFE_INTEGER)||other.gt(Decimal.MAX_SAFE_INTEGER)){
      if (this.lt(Math.exp(1/Math.E))){
        negln = t.ln().neg();
        return negln.lambertw().div(negln);
      }
      var j=t.slog(10).add(other);
      j.array[2]=(j.array[2]||0)+1;
      j.normalize();
      return j;
    }
    var y=other.toNumber();
    var f=Math.floor(y);
    var r=t.pow(y-f);
    var l=Decimal.NaN;
    for (var i=0,m=Decimal.E_MAX_SAFE_INTEGER;f!==0&&r.lt(m)&&i<100;++i){
      if (f>0){
        r=t.pow(r);
        if (l.eq(r)){
          f=0;
          break;
        }
        l=r;
        --f;
      }else{
        r=r.logBase(t);
        if (l.eq(r)){
          f=0;
          break;
        }
        l=r;
        ++f;
      }
    }
    if (i==100||this.lt(Math.exp(1/Math.E))) f=0;
    r.array[1]=(r.array[1]+f)||f;
    r.normalize();
    return r;
  };
  Q.tetrate=Q.tetr=function (x,y,payload){
    return new Decimal(x).tetr(y,payload);
  };
  //Implementation of functions from break_eternity.js
  P.iteratedexp=function (other,payload){
    return this.tetr(other,payload);
  };
  Q.iteratedexp=function (x,y,payload){
    return new Decimal(x).iteratedexp(y,payload);
  };
  //This implementation is highly inaccurate and slow, and probably be given custom code
  P.iteratedlog=function (base,other){
    if (base===undefined) base=10;
    if (other===undefined) other=Decimal.ONE.clone();
    var t=this.clone();
    base=new Decimal(base);
    other=new Decimal(other);
    if (other.eq(Decimal.ZERO)) return t;
    if (other.eq(Decimal.ONE)) return t.logBase(base);
    return base.tetr(t.slog(base).sub(other));
  };
  Q.iteratedlog=function (x,y,z){
    return new Decimal(x).iteratedlog(y,z);
  };
  P.layeradd=function (other,base){
    if (base===undefined) base=10;
    if (other===undefined) other=Decimal.ONE.clone();
    var t=this.clone();
    base=new Decimal(base);
    other=new Decimal(other);
    return base.tetr(t.slog(base).add(other));
  };
  Q.layeradd=function (x,y,z){
    return new Decimal(x).layeradd(y,z);
  };
  P.layeradd10=function (other){
    return this.layeradd(other);
  };
  Q.layeradd10=function (x,y){
    return new Decimal(x).layeradd10(y);
  };
  //End implementation from break_eternity.js
  //All of these are from Patashu's break_eternity.js
  //The super square-root function - what number, tetrated to height 2, equals this?
  //Other sroots are possible to calculate probably through guess and check methods, this one is easy though.
  //https://en.wikipedia.org/wiki/Tetration#Super-root
  P.ssqrt=P.ssrt=function (){
    var x=this.clone();
    if (x.lt(Math.exp(-1/Math.E))) return Decimal.NaN.clone();
    if (!x.isFinite()) return x;
    if (x.gt(Decimal.TETRATED_MAX_SAFE_INTEGER)) return x;
    if (x.gt(Decimal.EE_MAX_SAFE_INTEGER)){
      x.array[1]--;
      return x;
    }
    var l=x.ln();
    return l.div(l.lambertw());
  };
  Q.ssqrt=Q.ssrt=function (x){
    return new Decimal(x).ssqrt();
  };
  //Uses linear approximation
  //For more information, please see the break_eternity.js source:
  //https://github.com/Patashu/break_eternity.js/blob/96901974c175cb28f66c7164a5a205cdda783872/src/index.ts#L3901
  P.linear_sroot=function (degree){
    var x=new Decimal(this);
    degree=new Decimal(degree);
    if (degree.isNaN()) return Decimal.NaN.clone();
    var degreeNum=Number(degree);
    if (degreeNum==1) return x;
    if (x.eq(Decimal.POSITIVE_INFINITY)) return Decimal.POSITIVE_INFINITY.clone();
    if (!x.isFinite()) return Decimal.NaN.clone();
    if (degreeNum>0&&degreeNum<1) return x.root(degreeNum);
    if (degreeNum>-2&&degreeNum<-1) return degree.add(2).pow(x.recip());
    if (degreeNum<=0) return Decimal.NaN.clone();
    if (degree.gt(Decimal.MAX_SAFE_INTEGER)){
      var xNum=Number(x);
      if (xNum<Math.E&&xNum>1/Math.E) return x.pow(x.recip());
      if (x.gt(Decimal.TETRATED_MAX_SAFE_INTEGER)) return Decimal.tetr(10,x.slog(10).sub(degree));
      return Decimal.NaN.clone();
    }
    if (x.eq(Decimal.ONE)) return Decimal.ONE.clone();
    if (x.lt(Decimal.ZERO)) return Decimal.NaN.clone();
    if (x.gt(Decimal.ONE)){
      var upperBound;
      if (degreeNum<=1) upperBound=x.root(degree);
      else if (x.gte(Decimal.tetr(10,degree))) upperBound=x.iteratedlog(10,degreeNum-1);
      else upperBound=new Decimal(10);
      var lower=Decimal.ZERO;
      var layer=upperBound.array[2]||0;
      var upper=upperBound.iteratedlog(10,layer);
      var guess=upper.div(2);
      while (true){
        if (Decimal.iteratedexp(10,layer,guess).tetr(degree).gt(x)) upper=guess;
        else lower=guess;
        var newguess=lower.add(upper).div(2);
        if (newguess.eq(guess)) break;
        guess=newguess;
      }
      return Decimal.iteratedexp(10,layer,guess);
    }else{
      var BIG=new Decimal("10^^10");
      var stage=1;
      var minimum=BIG;
      var maximum=BIG;
      var lower=BIG
      var upper=new Decimal(1e-16)
      var prevspan=Decimal.ZERO;
      var difference=BIG;
      var upperBound=Decimal.pow(10,upper).recip();
      var distance=Decimal.ZERO;
      var prevPoint=upperBound;
      var nextPoint=upperBound;
      var evenDegree=Math.ceil(degreeNum)%2==0;
      var range=0;
      var lastValid=BIG;
      var infLoopDetector=false;
      var previousUpper=Decimal.ZERO;
      var decreasingFound=false;
      while (stage<4){
        if (stage==2){
          if (evenDegree) break;
          lower=BIG;
          upper=minimum;
          stage=3;
          difference=BIG;
          lastValid=BIG;
        }
        infLoopDetector=false;
        while (upper.neq(lower)){
          previousUpper=upper;
          var up10r=Decimal.pow(10,upper).recip();
          var up10rtd=up10r.tetr(degree);
          if (up10rtd.eq(Decimal.ONE)&&up10r.lt(0.4)){
            upperBound=up10r;
            prevPoint=up10r;
            nextPoint=up10r;
            distance=Decimal.ZERO;
            range=-1;
            if (stage==3) lastValid=upper;
          }else if (up10rtd.eq(up10r)&&!evenDegree&&up10r.lt(0.4)){
            upperBound=up10r;
            prevPoint=up10r;
            nextPoint=up10r;
            distance=Decimal.ZERO;
            range=0;
          }else if (up10rtd.eq(up10r.mul(2).tetr(degree))){
            upperBound=up10r;
            prevPoint=Decimal.ZERO;
            nextPoint=upperBound.mul(2);
            distance=upperBound;
            if (evenDegree) range=-1;
            else range=0;
          }else{
            prevspan=upper.mul(1.2e-16);
            upperBound=up10r;
            prevPoint=Decimal.pow(10,upper.add(prevspan)).recip();
            distance=upperBound.sub(prevPoint);
            nextPoint=upperBound.add(distance);
            var ubtd;
            var pptd;
            var nptd;
            while ((pptd=previousUpper.tetr(degree)).eq(ubtd=upperBound.tetr(degree))||(nptd=nextPoint.tetr(degree)).eq(ubtd)){
              prevspan=upper.mul(2);
              prevPoint=Decimal.pow(10,upper.add(prevspan)).recip();
              distance=upperBound.sub(prevPoint);
              nextPoint=upperBound.add(distance);
            }
            if (stage==1&&nptd.gt(ubtd)||stage==2&&nptd.lt(ubtd)) lastValid=upper;
            if (nptd.lt(ubtd)) range=-1;
            else if (evenDegree) range=1;
            else if (stage==3&&upper.gt_tolerance(minimum,1e-8)) range=0;
            else{
              while (prevPoint.gte(upperBound)||nextPoint.lte(upperBound)||(pptd=previousUpper.tetr(degree)).eq_tolerance(ubtd=upperBound.tetr(degree),1e-8)||(nptd=nextPoint.tetr(degree)).eq_tolerance(ubtd,1e-8)){
                prevspan=upper.mul(2);
                prevPoint=Decimal.pow(10,upper.add(prevspan)).recip();
                distance=upperBound.sub(prevPoint);
                nextPoint=upperBound.add(distance);
              }
              if (nptd.sub(ubtd).lt(ubtd.sub(pptd))) range=0;
              else range=1;
            }
          }
          if (range==-1) decreasingFound=true;
          if (stage==1&&range==1||stage==3&&range!=0){
            if (lower.eq(BIG)) upper=upper.mul(2);
            else{
              upper=upper.add(lower).div(2);
              if (infLoopDetector&&(range==1&&stage==1||range==-1&&stage==3)) break;
            }
          }else{
            if (lower.eq(BIG)){
              lower=upper;
              upper=upper.div(2);
            }else{
              lower=lower.sub(difference);
              upper=upper.sub(difference);
              if (infLoopDetector&&(range==1&&stage==1||range==-1&&stage==3)) break;
            }
          }
          var newDifference=lower.sub(upper).div(2).abs();
          if (newDifference.gt(difference.mul(1.5))) infLoopDetector=true;
          difference=newDifference;
          if (upper.gt(1e18)||upper.eq(previousUpper)) break;
        }
        if (upper.gt(1e18)) break;
        if (!decreasingFound) break;
        if (lastValid.eq(BIG)) break;
        if (stage==1) minimum=lastValid;
        else if (stage==3) maximum=lastValid;
        stage++;
      }
      lower=minimum;
      upper=new Decimal(1e-18);
      var previous=upper;
      var guess=Decimal.ZERO;
      var loopGoing=true;
      while (loopGoing){
        if (lower.eq(BIG)) guess=upper.mul(2);
        else guess=lower.add(upper).div(2);
        if (Decimal.pow(10,guess).recip().tetr(degree).gt(x)) upper=guess;
        else lower=guess;
        if (guess.eq(previous)) loopGoing=false;
        else previous=guess;
        if (upper.gt(1e18)) return Decimal.NaN.clone();
      }
      if (guess.neq_tolerance(minimum,1e-15)) return Decimal.pow(10,guess).recip();
      else{
        if (maximum.eq(BIG)) return Decimal.NaN.clone();
        lower=BIG;
        upper=maximum;
        previous=upper;
        guess=Decimal.ZERO;
        var loopGoing=true;
        while (loopGoing){
          if (lower.eq(BIG)) guess=upper.mul(2);
          else guess=lower.add(upper).div(2);
          if (Decimal.pow(10,guess).recip().tetr(degree).gt(x)) upper=guess;
          else lower=guess;
          if (guess.eq(previous)) loopGoing=false;
          else previous=guess;
          if (upper.gt(1e18)) return Decimal.NaN.clone();
        }
        return Decimal.pow(10,guess).recip();
      }
    }
  };
  Q.linear_sroot=function (x,y){
    return new Decimal(x).linear_sroot(y);
  };
  //Super-logarithm, one of tetration's inverses, tells you what size power tower you'd have to tetrate base to to get number. By definition, will never be higher than 1.8e308 in break_eternity.js, since a power tower 1.8e308 numbers tall is the largest representable number.
  //Uses linear approximation
  //https://en.wikipedia.org/wiki/Super-logarithm
  P.slog=function (base){
    if (base===undefined) base=10;
    var x=new Decimal(this);
    base=new Decimal(base);
    if (x.isNaN()||base.isNaN()||x.isInfinite()&&base.isInfinite()) return Decimal.NaN.clone();
    if (x.isInfinite()) return x;
    if (base.isInfinite()) return Decimal.ZERO.clone();
    if (x.lt(Decimal.ZERO)) return Decimal.ONE.neg();
    if (x.eq(Decimal.ONE)) return Decimal.ZERO.clone();
    if (x.eq(base)) return Decimal.ONE.clone();
    if (base.lt(Math.exp(1/Math.E))){
      var a=Decimal.tetr(base,Infinity);
      if (x.eq(a)) return Decimal.POSITIVE_INFINITY.clone();
      if (x.gt(a)) return Decimal.NaN.clone();
    }
    if (x.max(base).gt("10^^^"+MAX_SAFE_INTEGER)){
      if (x.gt(base)) return x;
      return Decimal.ZERO.clone();
    }
    if (x.max(base).gt(Decimal.TETRATED_MAX_SAFE_INTEGER)){
      if (x.gt(base)){
        x.array[2]--;
        x.normalize();
        return x.sub(x.array[1]);
      }
      return Decimal.ZERO.clone();
    }
    var r=0;
    var t=(x.array[1]||0)-(base.array[1]||0);
    if (t>3){
      var l=t-3;
      r+=l;
      x.array[1]=x.array[1]-l;
    }
    for (var i=0;i<100;++i){
      if (x.lt(Decimal.ZERO)){
        x=Decimal.pow(base,x);
        --r;
      }else if (x.lte(1)){
        return new Decimal(r+x.toNumber()-1);
      }else{
        ++r;
        x=Decimal.logBase(x,base);
      }
    }
    if (x.gt(10))
    return new Decimal(r);
  };
  Q.slog=function (x,y){
    return new Decimal(x).slog(y);
  };
  //end break_eternity.js excerpt
  P.pentate=P.pent=function (other){
    return this.arrow(3)(other);
  };
  Q.pentate=Q.pent=function (x,y){
    return Decimal.arrow(x,3,y);
  };
  //Uses linear approximations for real height
  P.arrow=function (arrows){
    var t=this.clone();
    arrows=new Decimal(arrows);
    if (!arrows.isint()||arrows.lt(Decimal.ZERO)) return function(other){return Decimal.NaN.clone();};
    if (arrows.eq(Decimal.ZERO)) return function(other){return t.mul(other);};
    if (arrows.eq(Decimal.ONE)) return function(other){return t.pow(other);};
    if (arrows.eq(2)) return function(other){return t.tetr(other);};
    return function (other){
      other=new Decimal(other);
      if (Decimal.debug>=Decimal.NORMAL) console.log(t+"{"+arrows+"}"+other);
      if (other.lt(Decimal.ZERO)) return Decimal.NaN.clone();
      if (other.eq(Decimal.ZERO)) return Decimal.ONE.clone();
      if (other.eq(Decimal.ONE)) return t.clone();
      if (arrows.gte(Decimal.maxArrow)){
        console.warn("Number too large to reasonably handle it: tried to "+arrows.add(2)+"-ate.");
        return Decimal.POSITIVE_INFINITY.clone();
      }
      var arrowsNum=arrows.toNumber();
      if (other.eq(2)) return t.arrow(arrows.sub(Decimal.ONE))(t);
      if (t.max(other).gt("10{"+(arrowsNum+1)+"}"+MAX_SAFE_INTEGER)) return t.max(other);
      var r;
      if (t.gt("10{"+arrowsNum+"}"+MAX_SAFE_INTEGER)||other.gt(Decimal.MAX_SAFE_INTEGER)){
        if (t.gt("10{"+arrowsNum+"}"+MAX_SAFE_INTEGER)){
          r=t.clone();
          r.array[arrowsNum]--;
          r.normalize();
        }else if (t.gt("10{"+(arrowsNum-1)+"}"+MAX_SAFE_INTEGER)){
          r=new Decimal(t.array[arrowsNum-1]);
        }else{
          r=Decimal.ZERO;
        }
        var j=r.add(other);
        j.array[arrowsNum]=(j.array[arrowsNum]||0)+1;
        j.normalize();
        return j;
      }
      var y=other.toNumber();
      var f=Math.floor(y);
      var arrows_m1=arrows.sub(Decimal.ONE);
      r=t.arrow(arrows_m1)(y-f);
      for (var i=0,m=new Decimal("10{"+(arrowsNum-1)+"}"+MAX_SAFE_INTEGER);f!==0&&r.lt(m)&&i<100;++i){
        if (f>0){
          r=t.arrow(arrows_m1)(r);
          --f;
        }
      }
      if (i==100) f=0;
      r.array[arrowsNum-1]=(r.array[arrowsNum-1]+f)||f;
      r.normalize();
      return r;
    };
  };
  P.chain=function (other,arrows){
    return this.arrow(arrows)(other);
  };
  Q.arrow=function (x,z,y){
    return new Decimal(x).arrow(z)(y);
  };
  Q.chain=function (x,y,z){
    return new Decimal(x).arrow(z)(y);
  };
  Q.hyper=function (z){
    z=new Decimal(z);
    if (z.eq(Decimal.ZERO)) return function(x,y){return new Decimal(y).eq(Decimal.ZERO)?new Decimal(x):new Decimal(x).add(Decimal.ONE);};
    if (z.eq(Decimal.ONE)) return function(x,y){return Decimal.add(x,y);};
    return function(x,y){return new Decimal(x).arrow(z.sub(2))(y);};
  };
  // All of these are from Patashu's break_eternity.js
  Q.affordGeometricSeries = function (resourcesAvailable, priceStart, priceRatio, currentOwned) {
    /*
      If you have resourcesAvailable, the price of something starts at
      priceStart, and on each purchase it gets multiplied by priceRatio,
      and you have already bought currentOwned, how many of the object
      can you buy.
    */
    resourcesAvailable=new Decimal(resourcesAvailable);
    priceStart=new Decimal(priceStart);
    priceRatio=new Decimal(priceRatio);
    var actualStart = priceStart.mul(priceRatio.pow(currentOwned));
    return Decimal.floor(resourcesAvailable.div(actualStart).mul(priceRatio.sub(Decimal.ONE)).add(Decimal.ONE).log10().div(priceRatio.log10()));
  };
  Q.affordArithmeticSeries = function (resourcesAvailable, priceStart, priceAdd, currentOwned) {
    /*
      If you have resourcesAvailable, the price of something starts at
      priceStart, and on each purchase it gets increased by priceAdd,
      and you have already bought currentOwned, how many of the object
      can you buy.
    */
    resourcesAvailable=new Decimal(resourcesAvailable);
    priceStart=new Decimal(priceStart);
    priceAdd=new Decimal(priceAdd);
    currentOwned=new Decimal(currentOwned);
    var actualStart = priceStart.add(currentOwned.mul(priceAdd));
    var b = actualStart.sub(priceAdd.div(2));
    var b2 = b.pow(2);
    return b.neg().add(b2.add(priceAdd.mul(resourcesAvailable).mul(2)).sqrt()).div(priceAdd).floor();
  };
  Q.sumGeometricSeries = function (numItems, priceStart, priceRatio, currentOwned) {
    /*
      If you want to buy numItems of something, the price of something starts at
      priceStart, and on each purchase it gets multiplied by priceRatio,
      and you have already bought currentOwned, what will be the price of numItems
      of something.
    */
    priceStart=new Decimal(priceStart);
    priceRatio=new Decimal(priceRatio);
    return priceStart.mul(priceRatio.pow(currentOwned)).mul(Decimal.sub(Decimal.ONE, priceRatio.pow(numItems))).div(Decimal.sub(Decimal.ONE, priceRatio));
  };
  Q.sumArithmeticSeries = function (numItems, priceStart, priceAdd, currentOwned) {
    /*
      If you want to buy numItems of something, the price of something starts at
      priceStart, and on each purchase it gets increased by priceAdd,
      and you have already bought currentOwned, what will be the price of numItems
      of something.
    */
    numItems=new Decimal(numItems);
    priceStart=new Decimal(priceStart);
    currentOwned=new Decimal(currentOwned);
    var actualStart = priceStart.add(currentOwned.mul(priceAdd));

    return numItems.div(2).mul(actualStart.mul(2).plus(numItems.sub(Decimal.ONE).mul(priceAdd)));
  };
  // Binomial Coefficients n choose k
  Q.choose = function (n, k) {
    /*
      If you have n items and you take k out,
      how many ways could you do this?
    */
    return new Decimal(n).factorial().div(new Decimal(k).factorial().mul(new Decimal(n).sub(new Decimal(k)).factorial()));
  };
  P.choose = function (other) {
    return Decimal.choose(this, other);
  };
  //end break_eternity.js excerpt
  P.normalize=function (){
    var b;
    var x=this;
    if (Decimal.debug>=Decimal.ALL) console.log(x.toString());
    if (!x.array||!x.array.length) x.array=[0];
    if (x.sign!=1&&x.sign!=-1){
      if (typeof x.sign!="number") x.sign=Number(x.sign);
      x.sign=x.sign<0?-1:1;
    }
    for (var l=x.array.length,i=0;i<l;i++){
      var e=x.array[i];
      if (e===null||e===undefined){
        x.array[i]=0;
        continue;
      }
      if (isNaN(e)){
        x.array=[NaN];
        return x;
      }
      if (!isFinite(e)){
        x.array=[Infinity];
        return x;
      }
      if (i!==0&&!Number.isInteger(e)) x.array[i]=Math.floor(e);
    }
    do{
      if (Decimal.debug>=Decimal.ALL) console.log(x.toString());
      b=false;
      while (x.array.length&&x.array[x.array.length-1]===0){
        x.array.pop();
        b=true;
      }
      if (x.array[0]>MAX_SAFE_INTEGER){
        x.array[1]=(x.array[1]||0)+1;
        x.array[0]=Math.log10(x.array[0]);
        b=true;
      }
      while (x.array[0]<MAX_E&&x.array[1]){
        x.array[0]=Math.pow(10,x.array[0]);
        x.array[1]--;
        b=true;
      }
      if (x.array.length>2&&!x.array[1]){
        for (i=2;!x.array[i];++i) continue;
        x.array[i-1]=x.array[0];
        x.array[0]=1;
        x.array[i]--;
        b=true;
      }
      for (l=x.array.length,i=1;i<l;++i){
        if (x.array[i]>MAX_SAFE_INTEGER){
          x.array[i+1]=(x.array[i+1]||0)+1;
          x.array[0]=x.array[i]+1;
          for (var j=1;j<=i;++j) x.array[j]=0;
          b=true;
        }
      }
    }while(b);
    if (!x.array.length) x.array=[0];
    return x;
  };
  var standardizeMessageSent=false;
  P.standardize=function (){
    if (!standardizeMessageSent) console.warn(DecimalError+"'standardize' method is being deprecated in favor of 'normalize' and will be removed in the future!"),standardizeMessageSent=true;
    return this.normalize();
  }
  P.toNumber=function (){
    //console.log(this.array);
    if (this.sign==-1) return -1*this.abs();
    if (this.array.length>=2&&(this.array[1]>=2||this.array[1]==1&&this.array[0]>Math.log10(Number.MAX_VALUE))) return Infinity;
    if (this.array[1]==1) return Math.pow(10,this.array[0]);
    return this.array[0];
  };
  P.toString=function (){
    if (this.sign==-1) return "-"+this.abs();
    if (isNaN(this.array[0])) return "NaN";
    if (!isFinite(this.array[0])) return "Infinity";
    var s="";
    if (this.array.length>=2){
      for (var i=this.array.length-1;i>=2;--i){
        var q=i>=5?"{"+i+"}":"^".repeat(i);
        if (this.array[i]>1) s+="(10"+q+")^"+this.array[i]+" ";
        else if (this.array[i]==1) s+="10"+q;
      }
    }
    if (!this.array[1]) s+=String(this.toNumber());
    else if (this.array[1]<3) s+="e".repeat(this.array[1]-1)+Math.pow(10,this.array[0]-Math.floor(this.array[0]))+"e"+Math.floor(this.array[0]);
    else if (this.array[1]<8) s+="e".repeat(this.array[1])+this.array[0];
    else s+="(10^)^"+this.array[1]+" "+this.array[0];
    return s;
  };
  //from break_eternity.js
  var decimalPlaces=function decimalPlaces(value,places){
    var len=places+1;
    var numDigits=Math.ceil(Math.log10(Math.abs(value)));
    if (numDigits<100) numDigits=0; //A hack-y solution to https://github.com/Naruyoko/ExpantaNum.js/issues/22
    var rounded=Math.round(value*Math.pow(10,len-numDigits))*Math.pow(10,numDigits-len);
    return parseFloat(rounded.toFixed(Math.max(len-numDigits,0)));
  };
  P.toStringWithDecimalPlaces=function (places,applyToOpNums){
    if (this.sign==-1) return "-"+this.abs();
    if (isNaN(this.array[0])) return "NaN";
    if (!isFinite(this.array[0])) return "Infinity";
    var b=0;
    var s="";
    var m=Math.pow(10,places);
    if (this.array.length>=2){
      for (var i=this.array.length-1;!b&&i>=2;--i){
        var x=this.array[i];
        if (applyToOpNums&&x>=m){
          ++i;
          b=x;
          x=1;
        }else if (applyToOpNums&&this.array[i-1]>=m){
          ++x;
          b=this.array[i-1];
        }
        var q=i>=5?"{"+i+"}":"^".repeat(i);
        if (x>1) s+="(10"+q+")^"+x+" ";
        else if (x==1) s+="10"+q;
      }
    }
    var k=this.array[0];
    var l=this.array[1]||0;
    if (k>m){
      k=Math.log10(k);
      ++l;
    }
    if (b) s+=decimalPlaces(b,places);
    else if (!l) s+=String(decimalPlaces(k,places));
    else if (l<3) s+="e".repeat(l-1)+decimalPlaces(Math.pow(10,k-Math.floor(k)),places)+"e"+decimalPlaces(Math.floor(k),places);
    else if (l<8) s+="e".repeat(l)+decimalPlaces(k,places);
    else if (applyToOpNums) s+="(10^)^"+decimalPlaces(l,places)+" "+decimalPlaces(k,places);
    else s+="(10^)^"+l+" "+decimalPlaces(k,places);
    return s;
  };
  //these are from break_eternity.js as well
  P.toExponential=function (places,applyToOpNums){
    if (this.array.length==1) return (this.sign*this.array[0]).toExponential(places);
    return this.toStringWithDecimalPlaces(places,applyToOpNums);
  };
  P.toFixed=function (places,applyToOpNums){
    if (this.array.length==1) return (this.sign*this.array[0]).toFixed(places);
    return this.toStringWithDecimalPlaces(places,applyToOpNums);
  };
  P.toPrecision=function (places,applyToOpNums){
    if (this.array[0]===0) return (this.sign*this.array[0]).toFixed(places-1,applyToOpNums);
    if (this.array.length==1&&this.array[0]<1e-6) return this.toExponential(places-1,applyToOpNums);
    if (this.array.length==1&&places>Math.log10(this.array[0])) return this.toFixed(places-Math.floor(Math.log10(this.array[0]))-1,applyToOpNums);
    return this.toExponential(places-1,applyToOpNums);
  };
  P.valueOf=function (){
    return this.toString();
  };
  //Note: toArray() would be impossible without changing the layout of the array or lose the information about the sign
  P.toJSON=function (){
    if (Decimal.serializeMode==Decimal.JSON){
      return {
        array:this.array.slice(0),
        sign:this.sign
      };
    }else if (Decimal.serializeMode==Decimal.STRING){
      return this.toString();
    }
  };
  P.toHyperE=function (){
    if (this.sign==-1) return "-"+this.abs().toHyperE();
    if (isNaN(this.array[0])) return "NaN";
    if (!isFinite(this.array[0])) return "Infinity";
    if (this.lt(Decimal.MAX_SAFE_INTEGER)) return String(this.array[0]);
    if (this.lt(Decimal.E_MAX_SAFE_INTEGER)) return "E"+this.array[0];
    var r="E"+this.array[0]+"#"+this.array[1];
    for (var i=2;i<this.array.length;++i){
      r+="#"+(this.array[i]+1);
    }
    return r;
  };
  Q.fromNumber=function (input){
    if (typeof input!="number") throw Error(invalidArgument+"Expected Number");
    var x=new Decimal();
    x.array[0]=Math.abs(input);
    x.sign=input<0?-1:1;
    x.normalize();
    return x;
  };
  var log10PosBigInt=function log10PosBigInt(input){
    var exp=BigInt(64);
    while (input>=BigInt(1)<<exp) exp*=BigInt(2);
    var expdel=exp/BigInt(2);
    while (expdel>BigInt(0)){
      if (input>=BigInt(1)<<exp) exp+=expdel;
      else exp-=expdel;
      expdel/=BigInt(2);
    }
    var cutbits=exp-BigInt(54);
    var firstbits=input>>cutbits;
    return Math.log10(Number(firstbits))+Math.LOG10E/Math.LOG2E*Number(cutbits);
  }
  Q.fromBigInt=function (input){
    if (typeof input!="bigint") throw Error(invalidArgument+"Expected BigInt");
    var x=new Decimal();
    var abs=input<BigInt(0)?-input:input;
    x.sign=input<BigInt(0)?-1:1;
    if (abs<=MAX_SAFE_INTEGER) x.array[0]=Number(abs);
    else x.array=[log10PosBigInt(abs),1];
    x.normalize();
    return x;
  }
  var LONG_STRING_MIN_LENGTH=17;
  var log10LongString=function log10LongString(str){
    return Math.log10(Number(str.substring(0,LONG_STRING_MIN_LENGTH)))+(str.length-LONG_STRING_MIN_LENGTH);
  }
  Q.fromString=function (input){
    if (typeof input!="string") throw Error(invalidArgument+"Expected String");
    var isJSON=false;
    if (typeof input=="string"&&(input[0]=="["||input[0]=="{")){
      try {
        JSON.parse(input);
      }finally{
        isJSON=true;
      }
    }
    if (isJSON){
      return Decimal.fromJSON(input);
    }
    var x=new Decimal();
    x.array=[0];
    if (!isDecimal.test(input)){
      console.warn(DecimalError+"Malformed input: "+input);
      x.array=[NaN];
      return x;
    }
    var negateIt=false;
    if (input[0]=="-"||input[0]=="+"){
      var numSigns=input.search(/[^-\+]/);
      var signs=input.substring(0,numSigns);
      negateIt=signs.match(/-/g).length%2==1;
      input=input.substring(numSigns);
    }
    if (input=="NaN") x.array=[NaN];
    else if (input=="Infinity") x.array=[Infinity];
    else out:{
      var a,b,c,d,i;
      while (input){
        if (/^\(?10[\^\{]/.test(input)){
          if (input[0]=="("){
            input=input.substring(1);
          }
          var arrows;
          if (input[2]=="^"){
            a=input.substring(2).search(/[^\^]/);
            arrows=a;
            b=a+2;
          }else{
            a=input.indexOf("}");
            arrows=Number(input.substring(3,a));
            b=a+1;
          }
          if (arrows>=Decimal.maxArrow){
            console.warn("Number too large to reasonably handle it: tried to "+(arrows+2)+"-ate.");
            x.array=[Infinity];
            break out;
          }
          input=input.substring(b);
          if (input[0]==")"){
            a=input.indexOf(" ");
            c=Number(input.substring(2,a));
            input=input.substring(a+1);
          }else{
            c=1;
          }
          if (arrows==1){
            x.array[1]=(x.array[1]||0)+c;
          }else if (arrows==2){
            a=x.array[1]||0;
            b=x.array[0]||0;
            if (b>=1e10) ++a;
            if (b>=10) ++a;
            x.array[0]=a;
            x.array[1]=0;
            x.array[2]=(x.array[2]||0)+c;
          }else{
            a=x.array[arrows-1]||0;
            b=x.array[arrows-2]||0;
            if (b>=10) ++a;
            for (i=1;i<arrows;++i){
              x.array[i]=0;
            }
            x.array[0]=a;
            x.array[arrows]=(x.array[arrows]||0)+c;
          }
        }else{
          break;
        }
      }
      a=input.split(/[Ee]/);
      b=[x.array[0],0];
      c=1;
      for (i=a.length-1;i>=0;--i){
        //The things that are already there
        if (b[0]<MAX_E&&b[1]===0){
          b[0]=Math.pow(10,c*b[0]);
        }else if (c==-1){
          if (b[1]===0){
            b[0]=Math.pow(10,c*b[0]);
          }else if (b[1]==1&&b[0]<=Math.log10(Number.MAX_VALUE)){
            b[0]=Math.pow(10,c*Math.pow(10,b[0]));
          }else{
            b[0]=0;
          }
          b[1]=0;
        }else{
          b[1]++;
        }
        //Multiplying coefficient
        var decimalPointPos=a[i].indexOf(".");
        var intPartLen=decimalPointPos==-1?a[i].length:decimalPointPos;
        if (b[1]===0){
          if (intPartLen>=LONG_STRING_MIN_LENGTH) b[0]=Math.log10(b[0])+log10LongString(a[i].substring(0,intPartLen)),b[1]=1;
          else if (a[i]) b[0]*=Number(a[i]);
        }else{
          d=intPartLen>=LONG_STRING_MIN_LENGTH?log10LongString(a[i].substring(0,intPartLen)):a[i]?Math.log10(Number(a[i])):0;
          if (b[1]==1){
            b[0]+=d;
          }else if (b[1]==2&&b[0]<MAX_E+Math.log10(d)){
            b[0]+=Math.log10(1+Math.pow(10,Math.log10(d)-b[0]));
          }
        }
        //Carrying
        if (b[0]<MAX_E&&b[1]){
          b[0]=Math.pow(10,b[0]);
          b[1]--;
        }else if (b[0]>MAX_SAFE_INTEGER){
          b[0]=Math.log10(b[0]);
          b[1]++;
        }
      }
      x.array[0]=b[0];
      x.array[1]=(x.array[1]||0)+b[1];
    }
    if (negateIt) x.sign*=-1;
    x.normalize();
    return x;
  };
  Q.fromArray=function (input1,input2){
    var array,sign;
    if (input1 instanceof Array&&(input2===undefined||typeof input2=="number")){
      array=input1;
      sign=input2;
    }else if (input2 instanceof Array&&typeof input1=="number"){
      array=input2;
      sign=input1;
    }else{
      throw Error(invalidArgument+"Expected an Array [and Boolean]");
    }
    var x=new Decimal();
    x.array=array.slice(0);
    if (sign) x.sign=Number(sign);
    else x.sign=1;
    x.normalize();
    return x;
  };
  Q.fromObject=function (input){
    if (typeof input!="object") throw Error(invalidArgument+"Expected Object");
    if (input===null) return Decimal.ZERO.clone();
    if (input instanceof Array) return Decimal.fromArray(input);
    if (input instanceof Decimal) return new Decimal(input);
    if (!(input.array instanceof Array)) throw Error(invalidArgument+"Expected that property 'array' exists");
    if (input.sign!==undefined&&typeof input.sign!="number") throw Error(invalidArgument+"Expected that property 'sign' is Number");
    var x=new Decimal();
    x.array=input.array.slice(0);
    x.sign=Number(input.sign)||1;
    x.normalize();
    return x;
  };
  Q.fromJSON=function (input){
    if (typeof input=="object") return Decimal.fromObject(parsedObject);
    if (typeof input!="string") throw Error(invalidArgument+"Expected String");
    var parsedObject,x;
    try{
      parsedObject=JSON.parse(input);
    }catch(e){
      parsedObject=null;
      throw e;
    }finally{
      x=Decimal.fromObject(parsedObject);
    }
    parsedObject=null;
    return x;
  };
  Q.fromHyperE=function (input){
    if (typeof input!="string") throw Error(invalidArgument+"Expected String");
    var x=new Decimal();
    x.array=[0];
    if (!/^[-\+]*(0|[1-9]\d*(\.\d*)?|Infinity|NaN|E[1-9]\d*(\.\d*)?(#[1-9]\d*)*)$/.test(input)){
      console.warn(DecimalError+"Malformed input: "+input);
      x.array=[NaN];
      return x;
    }
    var negateIt=false;
    if (input[0]=="-"||input[0]=="+"){
      var numSigns=input.search(/[^-\+]/);
      var signs=input.substring(0,numSigns);
      negateIt=signs.match(/-/g).length%2===0;
      input=input.substring(numSigns);
    }
    if (input=="NaN") x.array=[NaN];
    else if (input=="Infinity") x.array=[Infinity];
    else if (input[0]!="E"){
      x.array[0]=Number(input);
    }else if (input.indexOf("#")==-1){
      x.array[0]=Number(input.substring(1));
      x.array[1]=1;
    }else{
      var array=input.substring(1).split("#");
      for (var i=0;i<array.length;++i){
        var t=Number(array[i]);
        if (i>=2){
          --t;
        }
        x.array[i]=t;
      }
    }
    if (negateIt) x.sign*=-1;
    x.normalize();
    return x;
  };
  P.clone=function (){
    var temp=new Decimal();
    temp.array=this.array.slice(0);
    temp.sign=this.sign;
    return temp;
  };
  // Decimal methods

  /*
   *  clone
   *  config/set
   */

  /*
   * Create and return a Decimal constructor with the same configuration properties as this Decimal constructor.
   *
   */
  function clone(obj) {
    var i, p, ps;
    function Decimal(input,input2) {
      var x=this;
      if (!(x instanceof Decimal)) return new Decimal(input,input2);
      x.constructor=Decimal;
      var parsedObject=null;
      if (typeof input=="string"&&(input[0]=="["||input[0]=="{")){
        try {
          parsedObject=JSON.parse(input);
        }catch(e){
          //lol just keep going
        }
      }
      var temp,temp2;
      if (typeof input=="number"&&!(input2 instanceof Array)){
        temp=Decimal.fromNumber(input);
      }else if (typeof input=="bigint"){
        temp=Decimal.fromBigInt(input);
      }else if (parsedObject){
        temp=Decimal.fromObject(parsedObject);
      }else if (typeof input=="string"&&input[0]=="E"){
        temp=Decimal.fromHyperE(input);
      }else if (typeof input=="string"){
        temp=Decimal.fromString(input);
      }else if (input instanceof Array||input2 instanceof Array){
        temp=Decimal.fromArray(input,input2);
      }else if (input instanceof Decimal){
        temp=input.array.slice(0);
        temp2=input.sign;
      }else if (typeof input=="object"){
        temp=Decimal.fromObject(input);
      }else{
        temp=[NaN];
        temp2=1;
      }
      if (typeof temp2=="undefined"){
        x.array=temp.array;
        x.sign=temp.sign;
      }else{
        x.array=temp;
        x.sign=temp2;
      }
      return x;
    }
    Decimal.prototype = P;

    Decimal.JSON = 0;
    Decimal.STRING = 1;

    Decimal.NONE = 0;
    Decimal.NORMAL = 1;
    Decimal.ALL = 2;

    Decimal.clone=clone;
    Decimal.config=Decimal.set=config;

    //Decimal=Object.assign(Decimal,Q);
    for (var prop in Q){
      if (Q.hasOwnProperty(prop)){
        Decimal[prop]=Q[prop];
      }
    }

    if (obj === void 0) obj = {};
    if (obj) {
      ps = ['maxArrow', 'serializeMode', 'debug'];
      for (i = 0; i < ps.length;) if (!obj.hasOwnProperty(p = ps[i++])) obj[p] = this[p];
    }

    Decimal.config(obj);

    return Decimal;
  }

  function defineConstants(obj){
    for (var prop in R){
      if (R.hasOwnProperty(prop)){
        if (Object.defineProperty){
          Object.defineProperty(obj,prop,{
            configurable: false,
            enumerable: true,
            writable: false,
            value: new Decimal(R[prop])
          });
        }else{
          obj[prop]=new Decimal(R[prop]);
        }
      }
    }
    return obj;
  }

  /*
   * Configure global settings for a Decimal constructor.
   *
   * `obj` is an object with one or more of the following properties,
   *
   *   precision  {number}
   *   rounding   {number}
   *   toExpNeg   {number}
   *   toExpPos   {number}
   *
   * E.g. Decimal.config({ precision: 20, rounding: 4 })
   *
   */
  function config(obj){
    if (!obj||typeof obj!=='object') {
      throw Error(DecimalError+'Object expected');
    }
    var i,p,v,
      ps = [
        'maxArrow',1,Number.MAX_SAFE_INTEGER,
        'serializeMode',0,1,
        'debug',0,2
      ];
    for (i = 0; i < ps.length; i += 3) {
      if ((v = obj[p = ps[i]]) !== void 0) {
        if (Math.floor(v) === v && v >= ps[i + 1] && v <= ps[i + 2]) this[p] = v;
        else throw Error(invalidArgument + p + ': ' + v);
      }
    }

    return this;
  }


  // Create and configure initial Decimal constructor.
  Decimal=clone(Decimal);

  Decimal=defineConstants(Decimal);

  Decimal['default']=Decimal.Decimal=Decimal;

  // Export.

  // AMD.
  if (typeof define == 'function' && define.amd) {
    define(function () {
      return Decimal;
    });
  // Node and other environments that support module.exports.
  } else if (typeof module != 'undefined' && module.exports) {
    module.exports = Decimal;
    // Browser.
  } else {
    if (!globalScope) {
      globalScope = typeof self != 'undefined' && self && self.self == self
        ? self : Function('return this')();
    }
    globalScope.Decimal = Decimal;
  }
})(this);