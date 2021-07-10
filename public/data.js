const mongoose=require("mongoose");
mongoose.connect("mongodb://localhost:27017/participantsDB",{useNewUrlParser:true,useUnifiedTopology: true});
const participantsSchema={
    id:Number,
    name:String,
    roomI:String
  }
  
  const Participant=mongoose.model("Participant",participantsSchema);
  var count=1;
// count=count+1;
// const consumer1=new Participant({
//   id:count,
//   name:"ME",
//   roomI:roomId
// })
const part=[];
const consumer=new Participant({
    id:count,
     name:userName,
     roomI:roomId
   })
   part.push(consumer);
   count=count+1;
   consumer.save();