/* eslint-disable */
import * as THREE from "three";
import { useLayoutEffect, useRef, useState } from "react";
import { Canvas, applyProps, useFrame } from "@react-three/fiber";
import {
  PerformanceMonitor,
  AccumulativeShadows,
  RandomizedLight,
  Environment,
  Lightformer,
  Float,
  useGLTF,
} from "@react-three/drei";
import { LayerMaterial, Color, Depth } from "lamina";
import { useTheme } from "next-themes";

export function MiniModel() {
  const [degraded, degrade] = useState(false);
  const { theme } = useTheme();

  return (
    <Canvas shadows camera={{ position: [5, 0, 15], fov: 30 }}>
      <spotLight
        position={[0, 15, 0]}
        angle={0.3}
        penumbra={1}
        castShadow
        intensity={2}
        shadow-bias={-0.0001}
      />
      <ambientLight intensity={0.5} />
      <Mini
        scale={2}
        position={[-0.14, -0.22, 1]}
        rotation={[0, -Math.PI / 4, 0]}
      />
      <AccumulativeShadows
        position={[0, -1.16, 0]}
        frames={50}
        alphaTest={0.9}
        scale={10}
      >
        <RandomizedLight
          amount={8}
          radius={10}
          ambient={0.5}
          position={[1, 5, -1]}
        />
      </AccumulativeShadows>
      <PerformanceMonitor onDecline={() => degrade(true)} />
      <Environment frames={degraded ? 1 : Infinity} resolution={128} blur={1}>
        <Lightformers />
      </Environment>
      <color
        attach="background"
        args={[theme === "dark" ? "#0f1217" : "white"]}
      />
      <CameraRig />
    </Canvas>
  );
}

function Mini(props: any) {
  const { scene, nodes, materials } = useGLTF("/mini.glb") as any;
  useLayoutEffect(() => {
    Object.values(nodes).forEach((node) => {
      if (node instanceof THREE.Mesh) {
        node.receiveShadow = true;
        node.castShadow = true;
      }
    });
    if (materials["CAR_BODY_PAINT"]) {
      applyProps(materials["CAR_BODY_PAINT"], {
        color: "black",
        roughness: 0.45,
        metalness: 0.8,
        envMapIntensity: 2,
      });
    }

    if (materials["MATT"]) {
      applyProps(materials["MATT"], {
        color: "black",
        roughness: 0.45,
        metalness: 0.8,
        envMapIntensity: 2,
      });
    }

    if (materials["WINDOW_GLASS"]) {
      applyProps(materials["WINDOW_GLASS"], {
        color: "black",
        roughness: 0,
        clearcoat: 0.1,
      });
    }

    if (materials["LIGHT_GLASS"]) {
      applyProps(materials["LIGHT_GLASS"], {
        color: "black",
        roughness: 0,
        clearcoat: 0.1,
      });
    }

    if (materials["LIGHTS_POD"]) {
      applyProps(materials["LIGHTS_POD"], {
        roughness: 0,
        clearcoat: 0.1,
      });
    }

    if (materials["SHINY_METAL"]) {
      applyProps(materials["SHINY_METAL"], {
        color: "black",
        envMapIntensity: 4,
        roughness: 0.5,
        metalness: 1,
      });
    }

    if (materials["CALIPER"]) {
      applyProps(materials["CALIPER"], {
        color: "red",
        envMapIntensity: 4,
        roughness: 0.5,
        metalness: 1,
      });
    }
  }, [nodes, materials]);

  return <primitive object={scene} {...props} />;
}

function CameraRig({ v = new THREE.Vector3() }) {
  return useFrame((state) => {
    const t = state.clock.elapsedTime;

    state.camera.position.lerp(
      v.set(Math.sin(t / 2) * 1.2, 0, 12 + Math.cos(t / 5) / 2),
      0.05,
    );
    state.camera.lookAt(0, 0, 0);
  });
}

function Lightformers({ positions = [2, 0, 2, 0, 2, 0, 2, 0] }) {
  const group = useRef<THREE.Group>(null);

  useFrame(
    (state, delta) =>
      (group.current!.position.z += delta * 10) > 20 &&
      (group.current!.position.z = -60),
  );

  return (
    <>
      {/* Ceiling */}
      <Lightformer
        intensity={0.5}
        rotation-x={Math.PI / 2}
        position={[0, 5, -9]}
        scale={[10, 10, 1]}
      />
      <group rotation={[0, 0.5, 0]}>
        <group ref={group}>
          {positions.map((x, i) => (
            <Lightformer
              key={i}
              form="circle"
              intensity={2}
              rotation={[Math.PI / 2, 0, 0]}
              position={[x, 4, i * 4]}
              scale={[3, 1, 1]}
            />
          ))}
        </group>
      </group>
      {/* Sides */}
      <Lightformer
        intensity={4}
        rotation-y={Math.PI / 2}
        position={[-5, 1, -1]}
        scale={[20, 0.1, 1]}
      />
      <Lightformer
        rotation-y={Math.PI / 2}
        position={[-5, -1, -1]}
        scale={[20, 0.5, 1]}
      />
      <Lightformer
        rotation-y={-Math.PI / 2}
        position={[10, 1, 0]}
        scale={[20, 1, 1]}
      />
      {/* Accent (red) */}
      <Float speed={5} floatIntensity={2} rotationIntensity={2}>
        <Lightformer
          form="ring"
          color="blue"
          intensity={1}
          scale={10}
          position={[-15, 4, -18]}
          target={[0, 0, 0]}
        />
      </Float>
      {/* Background */}
      <mesh scale={100}>
        <sphereGeometry args={[1, 64, 64]} />
        <LayerMaterial side={THREE.BackSide}>
          <Color alpha={0.8} color="white" mode="normal" />
          <Depth
            alpha={0.5}
            colorA="black"
            colorB="white"
            far={300}
            mode="normal"
            near={0}
            origin={[100, 100, 100]}
          />
        </LayerMaterial>
      </mesh>
    </>
  );
}
