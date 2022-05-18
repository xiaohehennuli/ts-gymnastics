

interface Order {
  price:number
  name:string
}

interface Props {
  value:string
  name:string
  dataList:Order[]
}

// 手写partial

type myPartial<T>  = {
  [P in keyof T ]?:T[P]
}

const partialOrder:myPartial<Order> =  {
  
}


// 手写 pick

type myPick<T,K extends keyof T> = {
  [P in K]:T[P]
}

const pickOrder:myPick<Order,'name'> = {
  name:'2'
}

// 手写 Record

type myRecord<K extends keyof any,T> = {
  [P in K]:T
}

const recordOrder:myRecord<'data'|'order',Order> = {
  data:{
    price:1,
    name:'111'
  },
  order:{
    price:2,
    name:'2222'
  }
}

// 手写Exclude

// never 是底类型，表示不应该出现的类型
// 顶级类型 unknow any
// unknow 会收窄类型，any不会

type myExclude<T,U>= T extends U?never: T

const testExclude:myExclude<'name'|1,number> = 'name'

// 手写Extract 
// Extract 取交集

type myExtract<T,U> = T extends U?T:never

const testExtract:myExtract<'name'|1|(() => void),Function> = () => {}

// 手写Omit

// 方法一：使用pick实现
type myOmit<T,K extends keyof any> = Pick<T,Exclude<keyof T,K>>

// 方法二：不使用pick实现
type myOmit2<T,K extends keyof any> = {
  [P in Exclude<keyof T,K>]:T[P]
}

const myOrder:myOmit<Order,'name'> = {
  price:1,
}

const myOrder2:myOmit2<Order,'price'> = {
  name:'1'
}

//手写Parameters
// Parameter:可以获取函数指定参数
//infer 只能在条件语句中使用，它可以推导指定类型,并用一个变量存起来
//这里的T extends (...args:infer R) => any的意思是判断一个函数的参数是否包含在推到的参数之中
//又因为泛型 在extends的时候会被拆开，每一项逐一比较，比较的结果用一个元组装起来
//最后得到了type A
type myParameters<T extends Function> = T extends (...args:infer R) => any ? R : never

type F1 = (a:string,b:string,c:Pick<Order,'name'>) => void

type A = myParameters<F1>

// 扩展实现一个获取数组所有项类型的类型

type TargetArr = [string,number,[],Order,Props]

//这里的T extends Array<infer R>的意思是判断一个数组的所有项是否包含在推到的参数之中
type myGetArrParameters<T extends Array<any>> = T extends Array<infer R> ? R:never

type B = myGetArrParameters<TargetArr>

// 手写一个ReturnType
// ReturnTyep：返回一个函数的返回的类型

type F2 = (a:string,b:number,c:myGetArrParameters<TargetArr>) => Order

type myReturnType<T extends Function> = T extends (...args:any[]) => infer R ? R: never

type C = ReturnType<F2>

// 手写一个ConstructorParameters
// ConstructorParameters 可以获取一个构造函数的参数的类型

interface BrrorConstructor {
  new(message?: string): Error;
  (message?: string): Error;
  readonly prototype: Error;
}

class People {
  value:string
  constructor (order:Order,name:string) {
    this.value = ''
  }
}

// 这里为什么要加abstract，因为abstract类的兼容性是最好的，普通类和抽象类都可以赋给抽象类
// 若果不加abstract,那么myConstructorParameters类型将不能接受抽象类构造函数类型

type myConstructorParameters<T extends abstract new (...args:any) => any> = T extends new (...args:infer R) => any?R:never

// 这里为什么要加typeof
// 当把typeof 类作为类型时，返回的是该类里面的静态属性和方法
// 不加typeof 单独把类作为类型丢入的时候，获取的是该类的实例，即有方法也有属性，那么会报错，因为myConstructorParameters只需要构造方法
type D = myConstructorParameters<typeof People>

// 实现一个获取没有同时存在于T和U内的类型。
type SymmetricDifference<T, U> = Exclude<T | U, T & U>
type E = SymmetricDifference<keyof Order,keyof Props>

// FunctionKeys 获取T中所有类型为函数的key组成的联合类型

interface TargetFunctionKeys {
  name?:string
  value?:string
  title:null,
  un:undefined
  e:boolean,
  main:undefined,
  a?:() => void
  b?:() => string
  c?:() => number
  d:(a:string,d:number) => void
}
/**
 * T[]是索引访问操作，可以取到值的类型
   T['a' | 'b']若[]内参数是联合类型，则也是分发索引的特性，依次取到值的类型进行联合 
   T[keyof T]则是获取T所有值的类型类型；
   never和其他类型进行联合时，never是不存在的。例如：never | number | string等同于number | string
   never是任何类型的子类型
 */
  type FunctionKeys<T extends object> = {
    // 对于null 和 undefined 只用判断其中一种就可以，null和undefined是继承与Function的，不剔除不行
    [K in keyof T]: T[K] extends undefined?never:T[K] extends Function?K:never
  }[keyof T];

type F = FunctionKeys<TargetFunctionKeys>


// 实现一个获取 T中指定类型的key组成的联合类型

type BasicType = string | number| Object| Function | bigint | symbol | boolean

type KeysFactory<T extends object,U extends BasicType> = {
 [K in keyof T]:T[K] extends undefined?never:T[K] extends U?K:never
}[keyof T] 

type F3 = KeysFactory<TargetFunctionKeys,string>

// 查找T所有非只读类型的key组成的联合类型。(暂未实现)

interface OnlyReadTarget {
 readonly name:string
 readonly value:string
 title:string
 a:() => void
}

type NotOnlyReadKey<T extends object> = {
  [K in keyof T]:T[K] 
}

// OptionalKeys<T>提取T中所有可选类型的key组成的联合类型

interface OptionalKeysTarget {
  title?:string
  value?:string
  name:string,
  b?: () => void
}

type OptionalKeys<T extends object> = {
  [P in keyof T]:{} extends Pick<T,P>?P:never
}[keyof T]

type I = OptionalKeys<OptionalKeysTarget>

//增强Pick PickByValue提取指定值的类型

interface PickValueTarget {
  key1:string|number,
  key2:number,
  key3:string,
  key4:never
}

//判断两个类型是否真的是精准匹配
// string extends string | number // true
// 但是这两个类型是不是真的想等的，所以我们还需要倒过来匹配一遍
// string | number extends string // false
// 又因为泛型的分发型，我们一般会套一层元组[]来精准判断

type myEqual<K,U> = [K] extends [U]?[U] extends [K]?true:false:false

// 辅助类型，取符合要求的key
type getValue<T,U> = {
  // 但是这两个类型不是真的想等的，所以我们还需要倒过来匹配一遍
  // 又因为泛型的分发型，我们一般会套一层元组[]来精准判断
  [P in keyof T]:[T[P]] extends never?never:[T[P]] extends [U]?[U] extends [T[P]]?P:never:never
}[keyof T]

type Y = getValue<PickValueTarget,string|number> // key1

type PickValue<T,U> = Pick<T,getValue<T,U>>

type P = PickValue<PickValueTarget,string|number> // {key1:string|number}

//实现Intersection<T, U>从T中提取存在于U中的key和对应的类型。（注意，最终是从T中提取key和类型）

interface TestT {
  time: number
  name:string
  value:string
  price:number|string
  data:Order
}

interface TestU {
  time:string,
  price:number
  title:string,
  data:Order
}

// 思路用找到对应的key 用pick
// 用extract 找交集
// 比对两边是因为 number extends number|string // true 但是string | number extends number false 所以要判断完全相等
type Intersection<T extends object,U extends Object>= Pick<T,Extract<keyof T,keyof U>&Extract<keyof U,keyof T>>  

type In =  Intersection<TestT,TestU>

// 实现 Overwrite<T, U>从U中的同名属性的类型覆盖T中的同名属性类型。(后者中的同名属性覆盖前者)

type Overwrite<T extends Object,U extends Object> = {
  [K in keyof T]:K extends keyof Intersection<T,U>?U[K]:T[K]
}

type Ov = Overwrite<TestT,TestU>

// 手写一个MutableKeys 找出一个对象里非只读的属性
// 思路：遍历一个类型的所有key 用这个key和这个key的只读类型做比较，如果相等，那么保留这个k，如果不想等则返回never
// 涉及知识点：怎么比较两个类型是否相等
// [P in Keyof T]是映射类型，而映射是同态的，同态即会拷贝原有的属性修饰符等。可以参考R0的例子。

// 实现一个比较两个类型是否相等的类型
// 为什么要用这种方法来比较两个类型是否相等呢，为什么不用 A extends B & B extends A?
// 因为上面那种方式无法兼容 any
// 就是Ts编译器会认为如果两个类型（比如这里的X和Y）仅被用于约束两个相同的泛型函数则是相同的
// 这是ts编辑器规定的所以我们用这种方式来比较
type IfEquals<X,Y,A = X,B = never> = (<T>() => T extends X?1:2) extends (<T>() => T extends Y?1:2)?A:B 

interface MutableTarget {
  readonly name:string
  readonly title:string
  readonly privce:number
  readonly data:any
  value:string
}

type MutableKeys<T extends object> = {
  [P in keyof T]-?: IfEquals<
  { [Q in P]: T[P] },
  { -readonly [Q in P]: T[P] },
  P
>;
} [keyof T]

type M = MutableKeys<MutableTarget>

//DeepRequired

//DeepRequired<T>将T转换成必须属性
//如果T为对象，则将递归对象将所有key转换成required，类型转换为NonUndefined；
//如果T为数组则递归遍历数组将每一项设置为NonUndefined。

type NonUndefined<T> = T extends undefined ?never :T

interface testR{
  data: {
    b?:string
  },
  title?:string
  C:undefined
}

// required做不到深层次
type R = Required<testR>

type deepR = DeepRequiredObject<testR>

// const deepR_:deepR = {
//   data:{
//     b:'1'
//   },
//   title:'',
//   C:'never'
// }

// 实现思路:应该当T为数组或者对象时我们应该采用递归遍历它下面的属性转为required

// 辅助类型
interface DeepRequiredArray<T> extends Array<DeepRequired<NonUndefined<T>>> {}

// 辅助类型
type DeepRequiredObject<T extends object> = {
  [P in keyof T]-?: DeepRequired<NonUndefined<T[P]>>
}
// 一个小知识点 T[number]可以遍访问数组里面的类型
type TestA = [string,number,Order]

type TestJ = TestA[number] // string,number,Order

//当是函数类型或者是基本类型是返回t自己，如果不是则用辅助数组类型和辅助对象类型处理
type DeepRequired<T> = T extends (...args: any[]) => any
  ? T
  : T extends Array<any>
    ? DeepRequiredArray<T[number]>
    : T extends object
      ? DeepRequiredObject<T>
      : T;

//DeepReadonlyArray
//DeepReadonlyArray<T>将T的转换成只读的，如果T为object则将所有的key转换为只读的，如果T为数组则将数组转换成只读数组。整个过程是深度递归的。

/**
 * DeepReadonly实现
 */
 type DeepReadonly<T> = T extends ((...args: any[]) => any) | BasicType
 ? T
 : T extends _DeepReadonlyArray<infer U>
 ? _DeepReadonlyArray<U>
 : T extends _DeepReadonlyObject<infer V>
 ? _DeepReadonlyObject<V>
 : T;

/**
* 工具类型，构造一个只读数组
*/
interface _DeepReadonlyArray<T> extends ReadonlyArray<DeepReadonly<T>> {}

/**
* 工具类型，构造一个只读对象
*/
type _DeepReadonlyObject<T> = {
 readonly [P in keyof T]: DeepReadonly<T[P]>;
};


 //基本实现原理和DeepRequired一样，但是注意infer U自动推导数组的类型，infer V推导对象的类型。

 type MyA = Order | Props

 type MyB = boolean

 function myF<T extends Boolean>(a:T extends true?Order:Props ,b:MyB) {

 }