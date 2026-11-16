import AppKit
func load(_ path:String)->CGImage {let image=NSImage(contentsOfFile:path)!;var rect=CGRect(origin:.zero,size:image.size);return image.cgImage(forProposedRect:&rect,context:nil,hints:nil)!}
let args=CommandLine.arguments,reference=load(args[1]),render=load(args[2]),w=1074,h=1508
func write(_ image:CGImage,_ name:String){let rep=NSBitmapImageRep(cgImage:image);try! rep.representation(using:.png,properties:[:])!.write(to:URL(fileURLWithPath:args[3]+"/"+name))}
let color=CGColorSpaceCreateDeviceRGB()
let side=CGContext(data:nil,width:w*2,height:h,bitsPerComponent:8,bytesPerRow:0,space:color,bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
side.draw(reference,in:CGRect(x:0,y:0,width:w,height:h));side.draw(render,in:CGRect(x:w,y:0,width:w,height:h));write(side.makeImage()!,"reference-vs-render.png")
let overlay=CGContext(data:nil,width:w,height:h,bitsPerComponent:8,bytesPerRow:0,space:color,bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
overlay.draw(reference,in:CGRect(x:0,y:0,width:w,height:h));overlay.setAlpha(0.5);overlay.draw(render,in:CGRect(x:0,y:0,width:w,height:h));write(overlay.makeImage()!,"overlay.png")
overlay.setAlpha(1);overlay.draw(reference,in:CGRect(x:0,y:0,width:w,height:h));overlay.setBlendMode(.difference);overlay.draw(render,in:CGRect(x:0,y:0,width:w,height:h));write(overlay.makeImage()!,"difference.png")
