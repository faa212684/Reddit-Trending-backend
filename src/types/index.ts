export interface CommentRaw {
    forum:string,
    threadId:string,
    id:string
    author:string,
    created:Date,
    score:number,
    body:string,
    parent_id:string
    type:string
}